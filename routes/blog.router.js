import express from "express"
import { deleteBlog, GetBlog , getBlogByAuthor, GetBlogbyId, PostBlog } from "../controllers/blog.controller.js"

const router = express.Router()


router.post("/addblog" , PostBlog)
router.get("/get" , GetBlog)
router.get("/blogsByAuthor" , getBlogByAuthor)
router.get("/posts/:id" , GetBlogbyId)
router.delete("/delete" , deleteBlog)



export default router