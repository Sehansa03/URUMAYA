
const Story = require("./story.model");

// ============================================
// GET /api/v1/stories
// Public: Browse published heritage stories
// ============================================
const getStories = async (req, res) => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(
      1,
      parseInt(page, 10) || 1
    );

    const limitNumber = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 12)
    );

    const filter = {
      approvalStatus: "published",
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      const safeSearch = String(search).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.title = {
        $regex: safeSearch,
        $options: "i",
      };
    }

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),

      Story.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: stories,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get stories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve stories",
    });
  }
};

// ============================================
// GET /api/v1/stories/:slug
// Public: Read a published heritage story
// ============================================
const getStoryBySlug = async (req, res) => {
  try {
    const story = await Story.findOne({
      slug: req.params.slug,
      approvalStatus: "published",
    })
      .populate({
        path: "relatedProducts",
        match: {
          approvalStatus: "published",
          isActive: true,
        },
        select:
          "name slug price currency images category stockQuantity artisanName originDistrict",
      })
      .lean();

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error("Get story error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve story",
    });
  }
};

 // ============================================
 // POST /api/v1/stories
 // Staff/Admin: Create a heritage story draft
 // ============================================
 const createStory = async (req, res) => {
   try {
     // Verify that referenced products exist.
     if (req.body.relatedProducts?.length) {
       const Product = require("../products/product.model");

       const uniqueIds = [
         ...new Set(req.body.relatedProducts),
       ];

       const count = await Product.countDocuments({
         _id: { $in: uniqueIds },
       });

       if (count !== uniqueIds.length) {
         return res.status(400).json({
           success: false,
           message: "One or more related products do not exist",
         });
       }
     }

     const story = await Story.create({
       ...req.body,

       // New stories always start as drafts.
       approvalStatus: "draft",

       // Record the staff/admin creator.
       createdBy: req.user._id,

       reviewedBy: null,
     });

     return res.status(201).json({
       success: true,
       message: "Heritage story draft created successfully",
       data: story,
     });
   } catch (error) {
     if (error.code === 11000) {
       return res.status(409).json({
         success: false,
         message: "A story with this slug already exists",
       });
     }

     if (error.name === "ValidationError") {
       return res.status(400).json({
         success: false,
         message: error.message,
       });
     }

     console.error("Create story error:", error);

     return res.status(500).json({
       success: false,
       message: "Failed to create heritage story",
     });
   }
 };

const updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Staff can only edit stories they created.
    if (
      req.user.role === "staff" &&
      String(story.createdBy) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own stories",
      });
    }

    // Pending stories cannot be edited.
    if (story.approvalStatus === "pending") {
      return res.status(400).json({
        success: false,
        message: "Pending stories cannot be edited",
      });
    }

    // Verify referenced products if they are updated.
    if (req.body.relatedProducts !== undefined) {
      const Product = require("../products/product.model");

      const uniqueIds = [
        ...new Set(req.body.relatedProducts),
      ];

      const count = await Product.countDocuments({
        _id: { $in: uniqueIds },
      });

      if (count !== uniqueIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more related products do not exist",
        });
      }
    }

    // Apply only validated editable fields.
    Object.assign(story, req.body);

    // Published stories require approval after editing.
    if (story.approvalStatus === "published") {
      story.approvalStatus = "pending";
      story.reviewedBy = null;
    }

    // Rejected stories return to draft for revision.
    if (story.approvalStatus === "rejected") {
      story.approvalStatus = "draft";
      story.reviewedBy = null;
    }

    await story.save();

    return res.status(200).json({
      success: true,
      message: "Heritage story updated successfully",
      data: story,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A story with this slug already exists",
      });
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid story data or ID",
      });
    }

    console.error("Update story error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update heritage story",
    });
  }
};


 // ============================================
 // PATCH /api/v1/stories/:id/submit
 // Staff/Admin: Submit a story for approval
 // ============================================
 const submitStory = async (req, res) => {
   try {
     const story = await Story.findById(req.params.id);

     if (!story) {
       return res.status(404).json({
         success: false,
         message: "Story not found",
       });
     }

     // Staff can only submit their own stories.
     if (
       req.user.role === "staff" &&
       String(story.createdBy) !== String(req.user._id)
     ) {
       return res.status(403).json({
         success: false,
         message: "You can only submit your own stories",
       });
     }

     // Only drafts and rejected stories can be submitted.
     if (
       !["draft", "rejected"].includes(
         story.approvalStatus
       )
     ) {
       return res.status(400).json({
         success: false,
         message:
           "Only draft or rejected stories can be submitted",
       });
     }

     // Ensure required story information is present.
     if (
       !story.title?.trim() ||
       !story.excerpt?.trim() ||
       !story.content?.trim() ||
       !story.category
     ) {
       return res.status(400).json({
         success: false,
         message:
           "Complete the story details before submitting",
       });
     }

     story.approvalStatus = "pending";
     story.reviewedBy = null;

     await story.save();

     return res.status(200).json({
       success: true,
       message: "Story submitted for admin approval",
       data: story,
     });
   } catch (error) {
     if (error.name === "CastError") {
       return res.status(400).json({
         success: false,
         message: "Invalid story ID",
       });
     }

     console.error("Submit story error:", error);

     return res.status(500).json({
       success: false,
       message: "Failed to submit story",
     });
   }
 };

 // ============================================
 // PATCH /api/v1/stories/:id/approve
 // Admin: Approve and publish a heritage story
 // ============================================
 const approveStory = async (req, res) => {
   try {
     const story = await Story.findById(req.params.id);

     if (!story) {
       return res.status(404).json({
         success: false,
         message: "Story not found",
       });
     }

     // Only pending stories can be approved.
     if (story.approvalStatus !== "pending") {
       return res.status(400).json({
         success: false,
         message: "Only pending stories can be approved",
       });
     }

     story.approvalStatus = "published";
     story.reviewedBy = req.user._id;

     await story.save();

     return res.status(200).json({
       success: true,
       message: "Heritage story published successfully",
       data: story,
     });
   } catch (error) {
     if (error.name === "CastError") {
       return res.status(400).json({
         success: false,
         message: "Invalid story ID",
       });
     }

     console.error("Approve story error:", error);

     return res.status(500).json({
       success: false,
       message: "Failed to approve heritage story",
     });
   }
 };

 // ============================================
 // PATCH /api/v1/stories/:id/reject
 // Admin: Reject a pending heritage story
 // ============================================
 const rejectStory = async (req, res) => {
   try {
     const story = await Story.findById(req.params.id);

     if (!story) {
       return res.status(404).json({
         success: false,
         message: "Story not found",
       });
     }

     // Only pending stories can be rejected.
     if (story.approvalStatus !== "pending") {
       return res.status(400).json({
         success: false,
         message: "Only pending stories can be rejected",
       });
     }

     story.approvalStatus = "rejected";
     story.reviewedBy = req.user._id;

     await story.save();

     return res.status(200).json({
       success: true,
       message: "Heritage story rejected successfully",
       data: story,
     });
   } catch (error) {
     if (error.name === "CastError") {
       return res.status(400).json({
         success: false,
         message: "Invalid story ID",
       });
     }

     console.error("Reject story error:", error);

     return res.status(500).json({
       success: false,
       message: "Failed to reject heritage story",
     });
   }
 };

 // ============================================
 // GET /api/v1/stories/manage
 // Staff: View own stories
 // Admin: View all stories
 // ============================================
 const getManagedStories = async (req, res) => {
   try {
     const {
       status,
       category,
       search,
       page = 1,
       limit = 12,
     } = req.query;

     const pageNumber = Math.max(
       1,
       parseInt(page, 10) || 1
     );

     const limitNumber = Math.min(
       50,
       Math.max(1, parseInt(limit, 10) || 12)
     );

     const filter = {};

     // Staff can only view their own stories.
     if (req.user.role === "staff") {
       filter.createdBy = req.user._id;
     }

     // Filter by approval status.
     if (status) {
       const allowedStatuses = [
         "draft",
         "pending",
         "published",
         "rejected",
       ];

       if (!allowedStatuses.includes(status)) {
         return res.status(400).json({
           success: false,
           message: "Invalid story status",
         });
       }

       filter.approvalStatus = status;
     }

    
    // Filter stories using dynamic craft category slugs.
    // Include inactive categories so existing stories remain manageable.
    if (category) {
      if (
        typeof category !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid story category",
        });
      }

      filter.category = category;
    }


     // Search stories by title.
     if (search) {
       const safeSearch = String(search).replace(
         /[.*+?^${}()|[\]\\]/g,
         "\\$&"
       );

       filter.title = {
         $regex: safeSearch,
         $options: "i",
       };
     }

     const [stories, total] = await Promise.all([
       Story.find(filter)
         .sort({ createdAt: -1 })
         .skip((pageNumber - 1) * limitNumber)
         .limit(limitNumber)
         .populate("createdBy", "fullName email role")
         .populate("reviewedBy", "fullName email")
         .lean(),

       Story.countDocuments(filter),
     ]);

     return res.status(200).json({
       success: true,
       data: stories,
       pagination: {
         page: pageNumber,
         limit: limitNumber,
         total,
         totalPages: Math.ceil(total / limitNumber),
       },
     });
   } catch (error) {
     console.error("Get managed stories error:", error);

     return res.status(500).json({
       success: false,
       message: "Failed to retrieve managed stories",
     });
   }
 };


module.exports = {
  getStories,
  getStoryBySlug,
  getManagedStories,
  createStory,
  updateStory,
  submitStory,
  approveStory,
  rejectStory,
};

