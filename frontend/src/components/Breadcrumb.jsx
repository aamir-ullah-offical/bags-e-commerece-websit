import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb({ items }) {
 return (
 <nav className="flex items-center gap-1.5 py-4 text-xs font-medium text-stone-500 uppercase tracking-widest bg-stone-50 border-b border-stone-100 px-4 md:px-8 transition-colors">
 <Link
 to="/"
 className="flex items-center gap-1 text-stone-400 hover:text-stone-900 transition-colors"
 >
 <Home className="w-3.5 h-3.5" />
 </Link>
 {items.map((item, idx) => {
 const isLast = idx === items.length - 1;
 return (
 <div key={idx} className="flex items-center gap-1.5">
 <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
 {isLast || (!item.url && !item.to) ? (
 <span className="text-stone-900 font-semibold">{item.label}</span>
 ) : (
 <Link to={item.url || item.to} className="hover:text-stone-900 transition-colors">
 {item.label}
 </Link>
 )}
 </div>
 );
 })}
 </nav>
 );
}
