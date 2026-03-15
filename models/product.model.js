import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: 0,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        image: {
            type: String,
            default: "",
        },
        marketplaces: {
            type: [
                {
                    name: { type: String, required: true },
                    price: { type: Number, required: true },
                    url: { type: String, required: true }
                }
            ],
            default: []
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
