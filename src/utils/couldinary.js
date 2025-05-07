import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
 // Configuration Of Cloudinary
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDNIARY_API_SECRET //env file path may throw error
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
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadToCloud}