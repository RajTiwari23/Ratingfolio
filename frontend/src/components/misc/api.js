import axios, { AxiosError } from 'axios'
import { BACKEND_URL } from './config';

class AxiosInstance{
    constructor(base_url){
        this.axios = axios.create({
            baseURL:import.meta.env.DEV ? `http://127.0.0.1:5000/api`:base_url
        })
        const userData = JSON.parse(localStorage.getItem("userData"))
        if(userData){
            this.axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`
            this.axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*"
        }
    }

    async login(data){
        const response = await this.axios.post("/auth/login",{
            email:data.email,
            password:data.password
        })
        const json = await response.data;
        if(response.statusText !== "OK"){
            return {status:"FAILED",...json }
        }
        localStorage.setItem("userData",JSON.stringify(json))
        this.axios.defaults.headers.common['Authorization'] = `Bearer ${json.token}`;
        return {status:"SUCCESS","message":"Successfully logged in"}
    }

    async register(data){
        try{
        const response = await this.axios.post("/auth/register",{
            username:data.username,
            email:data.email,
            password:data.password
        })
        const json = await response.data;
        if(response.statusText !== "OK"){
            return {status:"FAILED",...json} 
        }
        localStorage.setItem("userData",JSON.stringify(json))
        this.axios.defaults.headers.common['Authorization'] = `Bearer ${json.token}`;
        return {status:"SUCCESS","message":"Successfully registered"}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                return {status:"FAILED",message:error.response.data.message}
        }
    }

    async verifyOtp(data){
        try{
        const response = await this.axios.post("/auth/verify-otp",{
            otp:data.otp
        })
        const json = await response.data;

        if(response.statusText !== "OK"){
            return {status:"FAILED",...json} 
        }
        this.axios.defaults.headers.common['Authorization'] = `Bearer ${json.token}`;
        return {status:"SUCCESS","message":"Successfully logged in"}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                return {status:"FAILED",message:error.response.data.message}
        }
    }
    async getUserData(){
        try{
            const response = await this.axios.get("/user/profile")
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED",...json}
            }
            return {status:"SUCCESS",data:json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED",message:error.response.data.message}
        }
    }
    async getProfileInfo(username){
        try{
            const response = await this.axios.get(`/profile/${username}`)
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED", ...json}
            }
            return {status:"SUCCESS",...json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED", message:error.response.data.message}
        }
    }

    async getProfileSubmissions(username, page=1){
        try{
            const response = await this.axios.get(`/profile/${username}/submissions`, {
                params:{
                    page:page
                }
            })
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED", ...json}
            }
            return {status:"SUCCESS",...json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED", message:error.response.data.message}
        }
    }
    async getProfileContests(username, page=1){
        try{
            const response = await this.axios.get(`/profile/${username}/contests`, {
                params:{
                    page:page
                }
            })
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED", ...json}
            }
            return {status:"SUCCESS", ...json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED", message:error.response.data.message}
        }
    }
    async getProfilePlatforms(username){
        try{
            const response = await this.axios.get(`/profile/${username}/platforms`)
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED", ...json}
            }
            return {status:"SUCCESS", ...json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED", message:error.response.data.message}
        }
    }
    async getProfileDaywiseSubmissions(username, page=1){
        try{
            const response = await this.axios.get(`/profile/${username}/daywise`,{
                params:{
                    page:page
                }
            })
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED", ...json}
            }
            return {status:"SUCCESS", ...json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED", message:error.response.data.message}
        }
    }
    async extractUserInfo(){
        try{
            const response = await this.axios.get("/user/extract")
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED",...json}
            }
            return {status:"SUCCESS", data:json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED",message:error.response.data.message}
        }
    }
    async getUserPlatforms(){
        try{
            const response = await this.axios.get("/user/platform")
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED",...json}
            }
            return {status:"SUCCESS", data:json}

        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED",message:error.response.data.message}
        }
    }
    async getUserPlatformDetail(platform_id){
        try{
            const response = await this.axios.get("/user/platform",{
                params:{
                    platform_id:platform_id
                }
            })
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED",...json}
            }
            return {status:"SUCCESS", data:json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED", message:error.response.data.message}
        }
    }
    async postUserPlatforms(data){
        try{
            const response = await this.axios.post("/user/platform", data)
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED",...json}
            }
            return {status:"SUCCESS", data:json}

        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED",message:error.response.data.message}
        }
    }
    async patchUserPlatform(platform_id, data){
        try{
            const response = await this.axios.patch("/user/platform",data, {
                params:{
                    platform_id:platform_id
                }
            })
            const json = await response.data;
            if(response.statusText !== "OK"){   
                return {status:"FAILED",...json}
            }
            return {status:"SUCCESS", data:json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status === 401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED", message:error.response.data.message}
        }
    }
    async searchProfile(query, page){
        try{
            const response = await this.axios.get("/profiles/search",{
                params:{
                    query:query,
                    page:page
                }
            })
            const json = await response.data;
            if(response.statusText !== "OK"){
                return {status:"FAILED",...json}
            }
            return {status:"SUCCESS", data:json}
        }catch(error){
            console.error(error)
            if(error instanceof AxiosError)
                if(error.response.status===401) return {status:"FAILED", message:"Unauthorized"}
                return {status:"FAILED", message:error.response.data.message}
        }
    }
}


export const api = new AxiosInstance(BACKEND_URL)