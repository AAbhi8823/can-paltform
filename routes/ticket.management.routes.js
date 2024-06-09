const router=require("express").Router()

const ticket_management_controller=require("../controllers/ticket.management.controllers")
const { routes } = require("./api")

//Routes
router.post("/add-ticket",ticket_management_controller.create_ticket)
router.get("/get-ticket-list",ticket_management_controller.get_tickets_list)
router.get("/get-ticket/:ticket_id",ticket_management_controller.get_ticket_by_id)
router.put("/update-ticket/:ticket_id",ticket_management_controller.update_ticket_by_id)
router.delete("/delete-ticket/:ticket_id",ticket_management_controller.delete_ticket_by_id)

router.get("/get-ticket-by-filter/:filter",ticket_management_controller.get_ticket_by_CANID_email)
router.get("/get-all-active-tickets",ticket_management_controller.get_total_active_tickets)
router.get("/get-all-resolved-tickets",ticket_management_controller.get_total_resolved_tickets)

module.exports=router