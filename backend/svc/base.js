

export class BasePlatform{
    async getAllSubmissions(){
        throw new Error("Not Implemented")    
    }

    async getAllContests(){
        throw new Error("Not Implemented")    
    }

    async calculateContestRating(){
        throw new Error("Not Implemented")    
    }
    async calculateContestAccuracy(){
        throw new Error("Not Implemented")    
    }
    async getParticipatedContest(){
        throw new Error("Not Implemented")
    }
    async calculateAccuracy(){
        throw new Error("Not Implemented")    
    }
    async checkValidity(user_handle){
        throw new Error("Not Implemented")    
    }
}

