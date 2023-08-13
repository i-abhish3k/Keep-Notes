const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

//Route 1: Get All Notes using :GET "/api/notes/fetchallnotes"  login reqyired
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    // console.log("Error in creating new user", error);
    console.error(error.message);
    res.status(500).send("Internal Server Error!1");
  }
});

//Route 2: Add a new Notes using :POST "/api/notes/addnote"  login reqyired
router.post("/addnote",
  [
    body("title", "Enter a vaild title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],fetchuser,async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //if there is errors, retuen bad erquest and error
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (error) {
      // console.log("Error in creating new user", error);
      console.error(error.message);
      res.status(500).send("Internal Server Error!2");
    }
  }
);

//Route 3: Update a existing  Notes using :PUT "/api/notes/updatenote"  login reqired also need a id
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    //create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    //Find the note to be update and update it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed.");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    // console.log("Error in creating new user", error);
    console.error(error.message);
    res.status(500).send("Internal Server Error!1");
  }
});

//Route 4: Delete a existing  Notes using :DELETE "/api/notes/deletenote"  login reqired also need a id
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //Find the note to be delete and delete it
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    //Allow deletion if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed.");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been Deleted.", note: note });
  } catch (error) {
    // console.log("Error in creating new user", error);
    console.error(error.message);
    res.status(500).send("Internal Server Error!1");
  }
});

module.exports = router;
