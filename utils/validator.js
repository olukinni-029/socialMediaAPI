import Joi from 'joi';

const signUpSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const profileSchema = Joi.object({
    bios: Joi.string().trim().required().messages({
      'string.empty': 'Bios field is required',
      'any.required': 'Bios field is required'
    }),
    profilePic:Joi.array().items(
        Joi.object({
          filename: Joi.string().required(),
          path: Joi.string().required()
        })
      )
  });

  const editSchema = Joi.object({
    username: Joi.string().optional(),
    bios: Joi.string().trim().optional().messages({
      'string.empty': 'Bios field is required',
      'any.required': 'Bios field is required'
    }),
    profilePic: Joi.object({
      filename: Joi.string().optional(),
      path: Joi.string().optional()
    }).optional()
  });

  const postSchema = Joi.object({
    text: Joi.string().optional(),
    images: Joi.object({
      filename: Joi.string().optional(),
      path: Joi.string().optional()
    }).optional(),
    video: Joi.object({
      filename: Joi.string().optional(),
      path: Joi.string().optional()
    }).optional()
  });
  

export {signUpSchema,loginSchema,profileSchema,editSchema,postSchema};

