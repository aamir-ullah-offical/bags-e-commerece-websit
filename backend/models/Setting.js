import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    group: {
      type: String,
      enum: ["contact", "website", "appearance", "pages", "media", "admin_profile"],
      default: "website",
    },
    description: String,
  },
  { timestamps: true }
);

// key index is created automatically via unique:true
settingSchema.index({ group: 1 });

// Static method to get setting by key
settingSchema.statics.get = async function (key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting
settingSchema.statics.set = async function (key, value, group = "website") {
  return this.findOneAndUpdate(
    { key },
    { key, value, group },
    { upsert: true, new: true }
  );
};

// Static method to get all settings in a group as an object
settingSchema.statics.getGroup = async function (group) {
  const settings = await this.find({ group });
  return settings.reduce((obj, s) => {
    obj[s.key] = s.value;
    return obj;
  }, {});
};

export default mongoose.model("Setting", settingSchema);
