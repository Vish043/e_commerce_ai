import express from "express";
import Order from "../models/Order.js";
import Inventory from "../models/Inventory.js";
import Ticket from "../models/Ticket.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {

    if (req.headers["x-api-key"] !== process.env.RETELL_SECRET) {
      return res.status(403).send("Unauthorized");
    }

    const { tool, data } = req.body;

    // 🔍 ORDER TRACKING
    if (tool === "get_order_status") {
      const order = await Order.findOne({ orderId: data.order_id });

      if (!order) {
        return res.json({ response: "Order not found." });
      }

      return res.json({
        response: `Your order is ${order.status} and will arrive by ${order.eta}.`
      });
    }

    // ❌ ORDER CANCELLATION
    if (tool === "cancel_order") {

      const order = await Order.findOne({ orderId: data.order_id });

      if (!order) {
        return res.json({ response: "Order not found." });
      }

      if (order.status !== "Processing") {
        return res.json({
          response: "Sorry, this order cannot be cancelled as it is already shipped."
        });
      }

      order.status = "Cancelled";
      order.refundStatus = "Processing";
      order.refundAmount = order.amount;

      await order.save();

      return res.json({
        response: `Your order has been successfully cancelled. Refund of ₹${order.amount} is being processed.`
      });
    }

    // 💰 REFUND STATUS
    if (tool === "get_refund_status") {

      const order = await Order.findOne({ orderId: data.order_id });

      if (!order) {
        return res.json({ response: "Order not found." });
      }

      return res.json({
        response: `Refund status for your order is ${order.refundStatus}.`
      });
    }

    // 📦 PRODUCT AVAILABILITY
    if (tool === "check_inventory") {

      const product = await Inventory.findOne({ productId: data.product_id });

      if (!product) {
        return res.json({ response: "Product not found." });
      }

      return res.json({
        response: product.stock > 0
          ? `Yes, ${product.productName} is in stock.`
          : `Sorry, ${product.productName} is currently out of stock.`
      });
    }

    // 🎟 CREATE SUPPORT TICKET
    if (tool === "create_ticket") {

      const newTicket = await Ticket.create({
        customerPhone: data.phone,
        issue: data.issue,
        priority: "Medium"
      });

      return res.json({
        response: `Your complaint has been registered. Ticket ID is ${newTicket._id}.`
      });
    }

    return res.json({ response: "Invalid request." });

  } catch (error) {
    console.error(error);
    return res.json({ response: "Something went wrong." });
  }
});

export default router;