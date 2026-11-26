const mongoose = require("mongoose");
const User = require("../auth/user.model");
const RefreshToken = require("../auth/refreshToken.model");

const {
  createStaffSchema,
  updateStaffSchema,
  updateStaffStatusSchema,
  resetStaffPasswordSchema,
} = require("./staff.validation");

// ==========================================
// HELPERS
// ==========================================

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Return only safe staff information
const formatStaff = (staff) => ({
  _id: staff._id,
  fullName: staff.fullName,
  email: staff.email,
  phone: staff.phone,
  role: staff.role,
  isActive: staff.isActive,
  createdAt: staff.createdAt,
  updatedAt: staff.updatedAt,
});

// Revoke existing refresh sessions
const revokeStaffSessions = async (
  staffId,
  currentVersion
) => {
  await RefreshToken.updateMany(
    {
      user: staffId,
      revokedAt: null,

      $or: [
        {
          tokenVersion: { $lt: currentVersion },
        },
        {
          tokenVersion: { $exists: false },
        },
      ],
    },
    {
      $set: { revokedAt: new Date() },
    }
  );
};

// ==========================================
// GET ALL STAFF
// ==========================================

const getStaff = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = req.query.search ?? "";
    const status = req.query.status ?? "";

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > 100000 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 50 ||
      typeof search !== "string" ||
      search.length > 100 ||
      !["", "active", "inactive"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff filters",
      });
    }

    const filter = { role: "staff" };

    if (search.trim()) {
      const pattern = escapeRegex(search.trim());

      filter.$or = [
        {
          fullName: {
            $regex: pattern,
            $options: "i",
          },
        },
        {
          email: {
            $regex: pattern,
            $options: "i",
          },
        },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const [
      staff,
      totalResults,
      totalStaff,
      activeStaff,
    ] = await Promise.all([
      User.find(filter)
        .select(
          "fullName email phone role isActive createdAt updatedAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),

      User.countDocuments({ role: "staff" }),

      User.countDocuments({
        role: "staff",
        isActive: true,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        staff: staff.map(formatStaff),

        statistics: {
          totalStaff,
          activeStaff,
          inactiveStaff: totalStaff - activeStaff,
        },

        pagination: {
          page,
          limit,
          totalResults,
          totalPages: Math.ceil(totalResults / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get staff error:", error.name);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve staff",
    });
  }
};

// ==========================================
// CREATE STAFF ACCOUNT
// ==========================================

const createStaff = async (req, res) => {
  try {
    const result = createStaffSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff details",
      });
    }

    const { fullName, email, password, phone } =
      result.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const staff = await User.create({
      fullName,
      email,
      password,
      phone,
      role: "staff",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      data: {
        staff: formatStaff(staff),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Create staff error:", error.name);

    return res.status(500).json({
      success: false,
      message: "Unable to create staff account",
    });
  }
};

// ==========================================
// UPDATE STAFF DETAILS
// ==========================================

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    const result = updateStaffSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff details",
      });
    }

    const staff = await User.findOne({
      _id: id,
      role: "staff",
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff account not found",
      });
    }

    const { fullName, email, phone } = result.data;

    const existingUser = await User.findOne({
      email,
      _id: { $ne: id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    staff.fullName = fullName;
    staff.email = email;
    staff.phone = phone;

    await staff.save();

    return res.status(200).json({
      success: true,
      message: "Staff details updated successfully",
      data: {
        staff: formatStaff(staff),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Update staff error:", error.name);

    return res.status(500).json({
      success: false,
      message: "Unable to update staff details",
    });
  }
};

// ==========================================
// ACTIVATE OR DEACTIVATE STAFF
// ==========================================

const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    const result = updateStaffStatusSchema.safeParse(
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid account status",
      });
    }

    const { isActive } = result.data;

    // Atomically update status and invalidate old sessions
    let staff = await User.findOneAndUpdate(
      {
        _id: id,
        role: "staff",
        isActive: { $ne: isActive },
      },
      {
        $set: { isActive },
        $inc: { tokenVersion: 1 },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    // Handle accounts whose status is already unchanged
    if (!staff) {
      staff = await User.findOne({
        _id: id,
        role: "staff",
      });

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: "Staff account not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Staff account status is already unchanged",
        data: {
          staff: formatStaff(staff),
        },
      });
    }

    // Revoke refresh sessions from older versions
    await revokeStaffSessions(
      staff._id,
      staff.tokenVersion
    );

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Staff account activated successfully"
        : "Staff account deactivated successfully",

      data: {
        staff: formatStaff(staff),
      },
    });
  } catch (error) {
    console.error(
      "Update staff status error:",
      error.name
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update staff status",
    });
  }
};

// ==========================================
// RESET STAFF PASSWORD
// ==========================================

const resetStaffPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    const result = resetStaffPasswordSchema.safeParse(
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid replacement password",
      });
    }

    const staff = await User.findOne({
      _id: id,
      role: "staff",
    }).select("+password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff account not found",
      });
    }

    const samePassword = await staff.comparePassword(
      result.data.password
    );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different",
      });
    }

    const bcrypt = require("bcryptjs");

    const hashedPassword = await bcrypt.hash(
      result.data.password,
      12
    );

    // Update password and version in one atomic operation
    const updatedStaff = await User.findOneAndUpdate(
      {
        _id: id,
        role: "staff",
        password: staff.password,
      },
      {
        $set: {
          password: hashedPassword,
        },
        $inc: {
          tokenVersion: 1,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedStaff) {
      return res.status(409).json({
        success: false,
        message: "Account changed. Please try again.",
      });
    }

    await revokeStaffSessions(
      updatedStaff._id,
      updatedStaff.tokenVersion
    );

    return res.status(200).json({
      success: true,
      message: "Staff password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset staff password error:",
      error.name
    );

    return res.status(500).json({
      success: false,
      message: "Unable to reset staff password",
    });
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  updateStaffStatus,
  resetStaffPassword,
};