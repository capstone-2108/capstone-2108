const Yup = require("yup");

const idSchema = Yup.object().shape({
  id: Yup.number("Id must be a number")
    .integer("Id must be a whole number")
    .required("Id is required")
});

const userSignupSchema = Yup.object().shape({
  firstName: Yup.string().trim().required("First name is required"),
  email: Yup.string()
    .trim()
    .required("An email address is required to checkout")
    .email("Must be a valid email address"),
  password: Yup.string().required("Password is required")
});

const productSchema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  imageUrl: Yup.string(),
  price: Yup.number()
    .integer()
    .min(1, "Price must be greater than 1 cent")
    .required("Price is required"),
  description: Yup.string(),
  quantity: Yup.number()
    .integer("Quantity must a whole number")
    .min(0, "Quantity must be greater than or equal to 0")
});

const cartProductQuantitySchema = Yup.object().shape({
  quantity: Yup.number()
    .integer("Quantity must a whole number")
    .min(0, "Quantity must be greater than or equal to 0")
});

module.exports = {
  idSchema,
  userSignupSchema,
  productSchema,
  cartProductQuantitySchema
};
