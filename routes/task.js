const express = require("express");
const { createTask,fetchTasks,updateTask,deleteTask } = require("../controllers/task");
const { taskValidator } = require("../validator/task");
const { requireSignin } = require("../controllers/auth");
const router = express.Router();

router.put("/create-task",  requireSignin, createTask);
router.put("/updateTask",  requireSignin, updateTask);
router.get("/fetchTasks", requireSignin,fetchTasks);
router.delete('/deleteTask',requireSignin, deleteTask)

module.exports = router;