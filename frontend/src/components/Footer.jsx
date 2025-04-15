import {Heart} from 'lucide-react'
export function Footer() {
  return (
    <div className="h-20 text-sm mt-10 border-t border-gray-200 py-5 flex justify-between items-center">
      <div>
        <p>Ratingfolio &copy; 2025 </p>
        <p className="flex items-center gap-1">Made with <span><Heart className="fill-red-500 text-red-500 size-4" /></span> by Raj Tiwari</p>
      </div>
      <div className="flex gap-2 font-plex underline underline-offset-2">
        <a href="https://www.linkedin.com/in/raj-tiwari-628089256/">LinkedIn</a>
      </div>
    </div>
  );
}
