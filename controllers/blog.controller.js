import User from "../models/auth.model.js";
import Post from "../models/blog.model.js"


  export const GetBlog = async (req, res) => {
    try {
     
      const page = parseInt(req.query.page) || 1; 
      const limit = parseInt(req.query.limit) || 10; 
      const skip = (page - 1) * limit; 
  
      const totalPosts = await Post.countDocuments();
      
      const data = await Post.find()
        .skip(skip)
        .limit(limit);
  
      return res.json({
        message: "All blogs fetched",
        data,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error occurred while fetching blogs" });
    }
  };

export const PostBlog = async (req, res) => {
  try {
    const { title, subtitle, content, author, image } = req.body;

    // Input validation
    if (!title || !subtitle || !content || !author) {
      return res.status(400).json({ message: "All fields are required except image" });
    }

    // Find the author by their name or username
    const foundAuthor = await User.findOne({ name: author }); // Adjust the field as necessary
    if (!foundAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Calculate read time based on content (basic word count)
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute); // Calculate read time

    // Create new blog post
    const newBlog = new Post({
      title,
      subtitle,
      content,
      author: foundAuthor._id, // Reference to the author's _id
      authorAvatar: foundAuthor.avatar || 'https://example.com/default-avatar.png', // If author has an avatar
      createdAt: new Date(),
      readTime,
      image: image || 'https://via.placeholder.com/150', // Use provided image or default
    });

    // Save the blog to the database
    await newBlog.save();

    return res.json({ message: "Blog created successfully!", blog: newBlog });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error occurred while adding the blog post." });
  }
};


export const getBlogByAuthor = async (req, res) => {
  try {
    // Fetch userId from the session
    const userId = req.session.userId || req.session.passport.user;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find posts by the author's userId
    const posts = await Post.find({ author: userId }).populate("author" ,"name avatar");

    if (!posts.length) {
      return res.status(404).json({ message: "No posts found by this author." });
    }

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in finding blogs by author:", err);
    res.status(500).json({ message: "Error in finding blogs." });
  }
};



    
export const GetBlogbyId =async  (req , res)=>{
  try{
            const id = req.params.id

          const data = await Post.findById(id)

          return res.json({ message: " blog fetched by id ", data });
  }catch(err){
      return res.status(500).json({message :"Error"})
  }
  }

  export const deleteBlog = async (req, res) => {
    try {
      const { id } = req.body;
  
      
      if (!id) {
        return res.status(400).json({ message: "Blog ID is required" });
      }
  
      const data = await Post.findByIdAndDelete(id);
      
      if (!data) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      return res.json({ message: "Blog deleted successfully", data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error occurred while deleting the blog" });
    }
  };
  