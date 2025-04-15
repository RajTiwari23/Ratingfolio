import PixelArtDashboard from '../misc/landing-page';
export function LandingSection(){
    return (
        <div className="bg-slate-50 min-h-[80vh] w-full flex items-center px-10 rounded justify-between">
          <div className="space-y-4 w-2/5">
            <h2 className="font-plex text-4xl font-medium">Track your performance in one unified platform</h2>
            <p className="text-slate-600 text-lg">Get all your rating, submissions, and accuracy metrics in one place. Visualize your progress and improve with data-driven insights.</p>
          </div>
          <PixelArtDashboard />
        </div> 
    )
}