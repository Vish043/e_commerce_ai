import express from "express";
import Order from "../models/Order.js";
import Inventory from "../models/Inventory.js";
import Ticket from "../models/Ticket.js";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    // Security check
    if (req.headers["x-api-key"] !== process.env.RETELL_SECRET) {
      return res.status(403).send("Unauthorized");
    }

    console.log("Incoming request:", req.body);

    // Detect function name from Retell
    let tool = req.body.tool || req.body.name;

    // Retell sends parameters directly
    let data = req.body.data || req.body;

    // -------------------------
    // ORDER STATUS
    // -------------------------

    if (tool === "get_order_status") {

      const order = await Order.findOne({
        orderId: data.order_id
      });

      if (!order) {
        return res.json({
          response: "Order not found."
        });
      }

      return res.json({
        response: `Your order is ${order.status} and will arrive by ${order.eta}.`
      });

    }

    // -------------------------
    // CANCEL ORDER
    // -------------------------

    if (tool === "cancel_order") {

      const order = await Order.findOne({
        orderId: data.order_id
      });

      if (!order) {
        return res.json({
          response: "Order not found."
        });
      }

      order.status = "Cancelled";

      await order.save();

      return res.json({
        response: "Your order has been successfully cancelled."
      });

    }

    // -------------------------
    // REFUND STATUS
    // -------------------------

    if (tool === "get_refund_status") {

      const order = await Order.findOne({
        orderId: data.order_id
      });

      if (!order) {
        return res.json({
          response: "Order not found."
        });
      }

      return res.json({
        response: `Refund status is ${order.refundStatus || "Not initiated"}.`
      });

    }

    // -------------------------
    // INVENTORY
    // -------------------------

    if (tool === "check_inventory") {

      const product = await Inventory.findOne({
        productId: data.product_id
      });

      if (!product) {
        return res.json({
          response: "Product not found."
        });
      }

      return res.json({
        response:
          product.stock > 0
            ? `${product.productName} is available in stock.`
            : `${product.productName} is currently out of stock.`
      });

    }

    // -------------------------
    // CREATE TICKET
    // -------------------------

    if (tool === "create_ticket") {

      const ticket = await Ticket.create({
        customerPhone: data.phone,
        issue: data.issue,
        priority: "Medium"
      });

      return res.json({
        response: `Your complaint has been registered. Ticket ID is ${ticket._id}.`
      });

    }

    // -------------------------
    // UNKNOWN REQUEST
    // -------------------------

    return res.json({
      response: "Invalid request."
    });

  }
  catch (error) {

    console.log(error);

    return res.json({
      response: "Server error."
    });

  }

});

export default router;