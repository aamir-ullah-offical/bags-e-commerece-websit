import Testimonial from "../models/Testimonial.js";
import * as R from "../utils/apiResponse.js";

export const getTestimonials = async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const testimonials = await Testimonial.find(filter).sort("sortOrder").lean();
  R.success(res, { testimonials });
};

export const createTestimonial = async (req, res) => {
  const testimonial = await Testimonial.create(req.body);
  R.created(res, { testimonial }, "Testimonial created");
};

export const updateTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!testimonial) return R.error(res, "Testimonial not found", 404);
  R.success(res, { testimonial }, "Testimonial updated");
};

export const deleteTestimonial = async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return R.error(res, "Testimonial not found", 404);
  R.success(res, {}, "Testimonial deleted");
};

export const bulkUpdateTestimonials = async (req, res) => {
  const { updates } = req.body;
  const ops = updates.map(({ id, ...fields }) => ({
    updateOne: { filter: { _id: id }, update: fields },
  }));
  await Testimonial.bulkWrite(ops);
  R.success(res, {}, "Testimonials updated");
};
