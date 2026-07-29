import Setting from "../models/Setting.js";
import * as R from "../utils/apiResponse.js";

const getGroup = async (group) => Setting.getGroup(group);

const saveGroup = async (group, data) => {
  await Promise.all(
    Object.entries(data).map(([key, value]) => Setting.set(key, value, group))
  );
};

export const getContactInfo = async (req, res) => {
  const data = await getGroup("contact");
  R.success(res, { settings: data });
};

export const saveContactInfo = async (req, res) => {
  await saveGroup("contact", req.body);
  R.success(res, {}, "Contact info saved");
};

export const getWebsiteSettings = async (req, res) => {
  const data = await getGroup("website");
  R.success(res, { settings: data });
};

export const saveWebsiteSettings = async (req, res) => {
  await saveGroup("website", req.body);
  R.success(res, {}, "Website settings saved");
};

export const getAppearanceSettings = async (req, res) => {
  const data = await getGroup("appearance");
  R.success(res, { settings: data });
};

export const saveAppearanceSettings = async (req, res) => {
  await saveGroup("appearance", req.body);
  R.success(res, {}, "Appearance settings saved");
};

export const getStaticPages = async (req, res) => {
  const data = await getGroup("pages");
  R.success(res, { settings: data });
};

export const saveStaticPages = async (req, res) => {
  await saveGroup("pages", req.body);
  R.success(res, {}, "Static pages saved");
};

export const getMedia = async (req, res) => {
  const data = await getGroup("media");
  R.success(res, { settings: data });
};

export const saveMedia = async (req, res) => {
  await saveGroup("media", req.body);
  R.success(res, {}, "Media settings saved");
};

export const getAllSettings = async (req, res) => {
  const settings = await Setting.find({}).lean();
  R.success(res, { settings });
};

export const getPublicSettings = async (req, res) => {
  const [website, contact, appearance] = await Promise.all([
    getGroup("website"),
    getGroup("contact"),
    getGroup("appearance"),
  ]);
  R.success(res, { settings: { website, contact, appearance } });
};
