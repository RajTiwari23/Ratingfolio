import { useEffect,useState } from "react";
import {parse,format, getDayOfYear, set, getDaysInYear} from "date-fns"

export function ProfileHeatmap({data}){
    const [year,setYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState([])
    const [yearwiseData, setYearwiseData] = useState({})
    const [loading, setLoading] = useState(false);
    function handleYearChange(e){
      setYear(e.target.value)
    }
    function parseYearwiseData(){
      const yearwiseData = {}
      const temp = new Set()
      Object.entries(data).forEach(([obj,submission])=>{
        const date = parse(obj, "dd/MM/yyyy", new Date())
        const year = format(date,"yyyy")
        temp.add(year)
        yearwiseData[year] = yearwiseData[year] || {}
        yearwiseData[year][getDayOfYear(date)] = submission
      })
      setYears([...temp])
      setYearwiseData({...yearwiseData})
      setLoading(false)
    }
    useEffect(()=>{
      setLoading(true);
      parseYearwiseData()
    },[year])
    function getColorDepth(submission){
        if(submission <= 10) return "bg-green-300"
        if(submission <= 20) return "bg-green-500"
        if(submission <= 30) return "bg-green-600"
        if(submission <= 40) return "bg-green-700"
        if(submission <= 50) return "bg-green-800"
        return "bg-slate-200"
    }
    return (
        <div>
            <select value={year} onChange={handleYearChange} className="bg-slate-100 p-2 rounded mb-4">
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className="bg-slate-100 w-full h-40 -z-10 rounded-t-lg flex p-4 gap-1 items-center justify-center">
              {loading 
                ? <div>Loading...</div> 
                : Array.from({ length: 53 }).map((_, i) => (
                    <div key={i} className="h-full w-4 flex flex-col justify-start gap-1">
                      {Array.from({ length: 7 }).map((_, j) => {
                        const dayOfYear = i * 7 + j + 1;
                        const submission = yearwiseData[year] && yearwiseData[year][dayOfYear];
                        return (dayOfYear <= getDaysInYear(year) && (
                          <div 
                            key={j} 
                            className={`size-4 ${getColorDepth(submission)}`}
                            title={submission ? `Day: ${format(set(new Date(year, 0, dayOfYear), {hours: 0, minutes: 0, seconds: 0, milliseconds: 0}), "dd/MM/yyyy")}, Submissions: ${submission}` : 'No submissions'}>
                          </div>
                        ));
                      })}
                    </div>
                  ))
              }
            </div>
        </div>
    )
}