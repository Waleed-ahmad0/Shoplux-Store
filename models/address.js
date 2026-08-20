import mongoose, { model, models, Schema } from "mongoose";
const AddressSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  apartment: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
});
const address=  models?.address || model('address', AddressSchema)
export default address