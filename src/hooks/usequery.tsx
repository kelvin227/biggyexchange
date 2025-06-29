import { useEffect, useState } from "react"

 export function useQuery (query: string): boolean {
    const getMatches = (query: string): boolean =>{
        if(typeof window != "undefined") {
            return window.matchMedia(query).matches;
        }    
        return false
    }
    const [matches, setmatches] = useState<boolean>(window.matchMedia(query).matches);

    useEffect(() => {
        function handleChange(){
            setmatches(getMatches(query))
        }
        const matchMedia = window.matchMedia(query);

        handleChange();
        matchMedia.addEventListener('change', handleChange);
        return() =>{
            matchMedia.removeEventListener('change', handleChange)
        }
    }, [query])

    return matches
}