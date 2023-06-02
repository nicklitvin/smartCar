const Messages : {[key : string] : Function} = {
    "destroyed": () => "Erased all data successfully",

    "completed": () => "Neural Network has completed the course! Start new road to train on other courses.",
    
    "courseDetail" : (previousBest : number ,currBest : number,
        previousMutation : number, currMutation : number,
        resetMutation : boolean, failureStreak : number
    ) => 
        [
            `Best Score: ${previousBest} -> ${currBest}`,
            `Mutation Constant: ${previousMutation} -> ${currMutation}`,
            `Was mutation constant reset? ${resetMutation}`,
            `Failure Streak: ${failureStreak}`
        ]    
    ,

    "improved": () => "Neural network has made progress!",

    "noImprove": () => "Neural network has not made progress. Adjustments made.",
    "newRoad": () => "Created a new road",
    "start": () => "Running simulation",
    "fastDevelop": (cycle : number ,attempts : number) => 
        `Running fast develop. Runs:${cycle}/${attempts}`
    ,
    "fastCompleted" : (completes : number, attempts : number) => 
        `Your Neural Network has completed ${completes} courses
        in ${attempts} attempts`
}

export default Messages;