export const authenticate  = async (req,res,next)=>{
    try{
        
        next();
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}