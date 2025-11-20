import { config } from "dotenv";
config(); //Will not work without this for some reason
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


 // Configuration Of Cloudinary
 console.log("Cloud variables: ",process.env.COULDINARY_NAME, 
    process.env.COULDINARY_API_KEY, 
    process.env.COULDINARY_API_SECRET);
 
 cloudinary.config({ 
    cloud_name: process.env.COULDINARY_NAME, 
    api_key: process.env.COULDINARY_API_KEY, 
    api_secret: process.env.COULDINARY_API_SECRET //env file path may throw error
});

const uploadToCloud =async (localFilePath)=>{
    try{
        if(!localFilePath)return null
        const response = await cloudinary.uploader.upload(
           localFilePath, {
               resource_type: "auto"
           }
       )
       console.log("File uploaded on cloud. File src:"+response.url);
       //Once file uploaded, delete from server
       fs.unlinkSync(localFilePath)
       return response
    }
    catch(error){
        console.log("Error on Cloudinary ",error);
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async (publicId,resource_type="image")=>{
    try{
        const result=await cloudinary.uploader.destroy(publicId,{resource_type});
        console.log("Deleted from cloudinary. Public id:",publicId);
    }catch(error){
        console.log("Error deleting form cloudinary", error);
        return null
    }
}

export {uploadToCloud, deleteFromCloudinary}