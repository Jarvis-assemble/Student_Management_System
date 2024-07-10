const express=require('express');
const router=express.Router()
const path=require('path')
router.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName; 
    const imagePath = path.join(__dirname,'database', 'images', imageName);
    res.sendFile(imagePath); 
  });
  module.exports=router