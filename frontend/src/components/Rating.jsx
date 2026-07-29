import { Star, StarHalf } from "lucide-react";

export default function Rating({ value, max = 5, size = 16, showText = false }) {
 const stars = [];
 const roundedValue = Math.round(value * 2) / 2;

 for (let i = 1; i <= max; i++) {
 if (i <= roundedValue) {
 stars.push(
 <Star key={i} size={size} className="text-amber-500 fill-amber-500 shrink-0" />
 );
 } else if (i - 0.5 === roundedValue) {
 stars.push(
 <StarHalf key={i} size={size} className="text-amber-500 fill-amber-500 shrink-0" />
 );
 } else {
 stars.push(
 <Star key={i} size={size} className="text-stone-200 shrink-0" />
 );
 }
 }

 return (
 <div className="flex items-center gap-1.5">
 <div className="flex items-center gap-0.5">{stars}</div>
 {showText && (
 <span className="text-xs font-medium text-stone-500 font-mono">
 {(value ?? 0).toFixed(1)}
 </span>
 )}
 </div>
 );
}
