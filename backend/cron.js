import { PlatformEnum } from "@prisma/client";
import { getPlatformByName } from "./utils.js";
export async function contestExtraction(){
    console.log("Extracting contests");
    const platforms = Object.values(PlatformEnum)
    for(const platform of platforms){
        const platformKlass = await getPlatformByName(platform.toString())
        await platformKlass.getAllContests()
    }
    console.log("Successfully Extracted contests");
}