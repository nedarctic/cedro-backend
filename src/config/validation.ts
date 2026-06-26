import * as Joi from 'joi';

export const validationSchema = Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    R2_ACCESS_KEY_ID: Joi.string().required(),
    R2_SECRET_ACCESS_KEY: Joi.string().required(),
    R2_ACCOUNT_ID: Joi.string().required(),
    R2_BUCKET_NAME: Joi.string().required(),
});