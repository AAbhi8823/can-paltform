const router=require("express").Router()

const ticket_management_controller=require("../controllers/ticket.management.controllers")

//Routes
router.post("/add-ticket",ticket_management_controller.create_ticket)
router.get("/get-ticket-list",ticket_management_controller.get_tickets_list)
router.get("/get-ticket/:ticket_id",ticket_management_controller.get_ticket_by_id)
router.put("/update-ticket/:ticket_id",ticket_management_controller.update_ticket_by_id)
router.delete("/delete-ticket/:ticket_id",ticket_management_controller.delete_ticket_by_id)


module.exports=router