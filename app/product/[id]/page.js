"use client";
import { use, useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import toast from "react-hot-toast";
function getFirstVariant(product) {
  if (!product.variants || product.variants.length === 0) return null;
  return product.variants[0];
}
function getAvailableAttributes(variants) {
  const attributes = {};
  variants.forEach((variant) => {
    if (variant.attributes) {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!attributes[key]) {
          attributes[key] = new Set();
        }
        attributes[key].add(value);
      });
    }
  });
  const result = {};
  Object.keys(attributes).forEach((key) => {
    result[key] = Array.from(attributes[key]);
  });
  return result;
}
function findVariantByAttributes(variants, selectedAttributes) {
  return variants.find((variant) => {
    if (!variant.attributes) return false;
    for (const [key, value] of Object.entries(selectedAttributes)) {
      if (variant.attributes[key] !== value) {
        return false;
      }
    }
    if (
      Object.keys(variant.attributes).length !==
      Object.keys(selectedAttributes).length
    ) {
      return false;
    }
    return true;
  });
}
function isCombinationAvailable(variants, attributes) {
  return variants.some((variant) => {
    if (!variant.attributes) return false;
    for (const [key, value] of Object.entries(attributes)) {
      if (variant.attributes[key] !== value) {
        return false;
      }
    }
    return (
      Object.keys(variant.attributes).length === Object.keys(attributes).length
    );
  });
}
function getAvailableOptions(variants, attributeType, currentAttributes) {
  const availableOptions = new Set();
  variants.forEach((variant) => {
    if (!variant.attributes) return;
    let matches = true;
    for (const [key, value] of Object.entries(currentAttributes)) {
      if (key !== attributeType && variant.attributes[key] !== value) {
        matches = false;
        break;
      }
    }
    if (matches && variant.attributes[attributeType]) {
      availableOptions.add(variant.attributes[attributeType]);
    }
  });
  return Array.from(availableOptions);
}
function findClosestVariant(variants, attributeType, value) {
  const variantsWithValue = variants.filter(
    (v) => v.attributes && v.attributes[attributeType] === value,
  );
  if (variantsWithValue.length > 0) {
    return variantsWithValue[0];
  }
  return variants[0];
}
export default function ProductPage({ params }) {
  const { data, status } = useSession();
  const router = useRouter();
  const id = decodeURIComponent(use(params).id);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [pictureno, setPictureNo] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableAttributes, setAvailableAttributes] = useState({});
  const [filteredreviews, setfilteredreviews] = useState([]);
  const [avgrating, setavgrating] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restockAmount, setRestockAmount] = useState(0);
  const [isRestocking, setIsRestocking] = useState(false);
  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const reviews = await fetch("/api/review");
        const reviewResponse = await reviews.json();
        const filteredReviews = reviewResponse.filter(
          (r) => r.productId === id,
        );
        setfilteredreviews(filteredReviews);
        setavgrating(
          filteredReviews.reduce((sum, r) => sum + r.rating, 0) /
            filteredReviews.length,
        );
        const allProducts = await response.json();
        const productData = allProducts.find((item) => item._id === id);
        if (!productData) {
          setError("Product not found");
          return;
        }
        setProduct(productData);
        const attributes = getAvailableAttributes(productData.variants);
        setAvailableAttributes(attributes);
        const firstVariant = getFirstVariant(productData);
        if (firstVariant && firstVariant.attributes) {
          const initialAttributes = {};
          Object.entries(firstVariant.attributes).forEach(([key, value]) => {
            initialAttributes[key] = value;
          });
          setSelectedAttributes(initialAttributes);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);
  function ErrorScreen({ message, onRetry }) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-x-4">
            <button
              onClick={router.back}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go back
            </button>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  const handleAttributeChange = (attributeType, value) => {
    let newAttributes = { ...selectedAttributes, [attributeType]: value };
    if (!isCombinationAvailable(product.variants, newAttributes)) {
      const closestVariant = findClosestVariant(
        product.variants,
        attributeType,
        value,
      );
      if (closestVariant && closestVariant.attributes) {
        newAttributes = { ...closestVariant.attributes };
      }
    }
    setSelectedAttributes(newAttributes);
    setPictureNo(0);
  };
  const getSelectedVariant = () => {
    if (!product || !product.variants) return null;
    return findVariantByAttributes(product.variants, selectedAttributes);
  };
  const getFilteredOptions = (attributeType) => {
    if (!product || !product.variants) return [];
    return getAvailableOptions(
      product.variants,
      attributeType,
      selectedAttributes,
    );
  };
  const isCombinationValid = !!getSelectedVariant();
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setCombinationError("");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  if (loading) {
    return <LoadingScreen message="Loading product..." />;
  }
  if (error) {
    return <ErrorScreen message={error} onRetry={handleRetry} />;
  }
  if (!product) {
    return (
      <ErrorScreen
        message="The product you're looking for doesn't exist."
        onRetry={handleRetry}
      />
    );
  }
  const selectedVariant = getSelectedVariant();
  const images = selectedVariant?.images || [];
  const price = selectedVariant?.price || 0;
  const salePrice = selectedVariant?.salePrice;
  const stockCount = selectedVariant?.stockCount || 0;
  const displayPrice = salePrice || price;
  const isOnSale = !!salePrice;
  const renderStars = (rating, size = "text-lg") => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`${size} text-yellow-500`}>
            {star <= fullStars
              ? "★"
              : star === fullStars + 1 && hasHalfStar
                ? "★"
                : "☆"}
          </span>
        ))}
      </div>
    );
  };
  const addingtocart = async () => {
    if (!data?.user?.id) {
      toast.error("Please login to add items to cart", {
        position: "top-center",
      });
      return;
    }
    setIsAddingToCart(true);
    try {
      const productdata = {
        productId: product._id,
        userId: data.user.id,
        name: product.name,
        brand: product.brand,
        image: images[0],
        price,
        quantity,
        stockCount,
        selectedVariant: selectedAttributes,
        salePrice,
      };
      const sendingcartproduct = await fetch(`/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productdata),
      });
      const response = await sendingcartproduct.json();
      if (response.error === "product already in the cart") {
        toast("Product is already in cart", {
          position: "top-center",
        });
      } else if (sendingcartproduct.ok) {
        toast.success("Product added to cart!", {
          position: "top-center",
        });
      } else {
        toast.error("Error adding to cart", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Failed to add to cart", {
        position: "top-center",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  const handleDelete = async () => {
    setShowDeleteModal(false);
    try {
      setLoading(true);
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productid: product._id }),
      });
      if (res.ok) {
        toast.success("Product deleted successfully");
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete product");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting");
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    const currentVariant = getSelectedVariant();
    if (!currentVariant || restockAmount <= 0) return;
    setIsRestocking(true);
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          productId: product._id, 
          sku: currentVariant.sku, 
          additionalStock: restockAmount 
        }),
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setProduct(updatedProduct);
        setRestockAmount(0);
        toast.success("Stock updated successfully");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update stock");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating stock");
    } finally {
      setIsRestocking(false);
    }
  };
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="aspect-square bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-200 overflow-hidden group relative">
                {images.length > 0 ? (
                  <Image
                    key={`${selectedVariant?.sku}-${pictureno}`}
                    src={images[pictureno]}
                    alt={`Product Image ${pictureno + 1}`}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover bg-linear-to-br from-gray-100 to-gray-200"
                    unoptimized={images[pictureno]?.startsWith("/uploads")}
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm sm:text-base lg:text-lg">
                      No Image Available
                    </span>
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        pictureno >= 1 && setPictureNo((p) => p - 1)
                      }
                      disabled={pictureno === 0}
                      aria-label="Previous image"
                      title="Previous image"
                      className="absolute left-2 sm:left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-md sm:shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-white hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        pictureno < images.length - 1 &&
                        setPictureNo((p) => p + 1)
                      }
                      disabled={pictureno === images.length - 1}
                      aria-label="Next image"
                      title="Next image"
                      className="absolute right-2 sm:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-md sm:shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-white hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
                {images.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full lg:hidden">
                    {pictureno + 1} / {images.length}
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex lg:grid lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={`${selectedVariant?.sku}-thumb-${idx}`}
                      onClick={() => setPictureNo(idx)}
                      aria-label={`View image ${idx + 1}`}
                      title={`View image ${idx + 1}`}
                      className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-full lg:aspect-square bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md border-2 overflow-hidden transition-all duration-300 ${
                        pictureno === idx
                          ? "border-blue-500 ring-1 sm:ring-2 ring-blue-200 scale-105 shadow-md sm:shadow-lg"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md sm:hover:shadow-lg active:scale-95"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                        unoptimized={img?.startsWith("/uploads")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:pl-4 xl:pl-8 space-y-4 sm:space-y-6 lg:space-y-8">
              {product.brand && (
                <div className="text-sm sm:text-base lg:text-lg font-semibold text-blue-600">
                  {product.brand}
                </div>
              )}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                {data?.user?.role === "admin" && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-100">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 transition-colors bg-white px-3 py-2 rounded-lg shadow-sm border border-red-100 hover:border-red-200"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Product
                    </button>
                    {isCombinationValid && (
                       <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            min="1" 
                            value={restockAmount === 0 ? '' : restockAmount} 
                            onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                            className="w-20 px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="Qty"
                          />
                          <button
                            onClick={handleRestock}
                            disabled={isRestocking || restockAmount <= 0}
                            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {isRestocking ? 'Restocking...' : 'Restock'}
                          </button>
                       </div>
                    )}
                  </div>
                )}
                {filteredreviews.length > 0 ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {renderStars(avgrating, "text-sm sm:text-base lg:text-lg")}
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {avgrating.toFixed(1)}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">|</span>
                    <Link
                      className="text-blue-700 underline font-medium text-sm sm:text-base"
                      href={`/review/${id}`}
                    >
                      {filteredreviews.length} reviews
                    </Link>
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm sm:text-base">
                    No reviews yet
                  </div>
                )}
                {isCombinationValid ? (
                  <div className="flex items-center flex-wrap gap-2 sm:gap-3 lg:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                      ${displayPrice}
                    </span>
                    {isOnSale && (
                      <>
                        <span className="text-base sm:text-lg lg:text-xl text-gray-500 line-through">
                          ${price}
                        </span>
                        <span className="text-xs sm:text-sm font-bold bg-red-100 text-red-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                          {Math.round((1 - salePrice / price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm sm:text-base">
                    Select available options to see price
                  </div>
                )}
              </div>
              {Object.keys(availableAttributes).length > 0 && (
                <div className="space-y-4 sm:space-y-5 lg:space-y-6 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Select Options
                  </h3>
                  {Object.entries(availableAttributes).map(
                    ([attributeType, allValues]) => {
                      const availableOptions =
                        getFilteredOptions(attributeType);
                      return (
                        <div
                          key={attributeType}
                          className="space-y-2 sm:space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <label className="font-semibold text-gray-700 capitalize text-sm sm:text-base">
                              {attributeType
                                .replace(/([A-Z])/g, " $1")
                                .toLowerCase()}
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            {allValues.map((value) => {
                              const isSelected =
                                selectedAttributes[attributeType] === value;
                              const isAvailableWithCurrent =
                                availableOptions.includes(value);
                              return (
                                <button
                                  key={value}
                                  onClick={() =>
                                    handleAttributeChange(attributeType, value)
                                  }
                                  className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl border-2 font-medium text-sm sm:text-base transition-all duration-200 relative active:scale-95 ${
                                    isSelected
                                      ? "bg-blue-600 text-white border-blue-600 shadow-md sm:shadow-lg scale-105"
                                      : isAvailableWithCurrent
                                        ? "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md"
                                        : "bg-gray-100 border-gray-300 text-gray-600 opacity-70 hover:bg-gray-150 hover:border-gray-400 cursor-pointer"
                                  }`}
                                  title={
                                    !isAvailableWithCurrent
                                      ? "Click to switch to this variant"
                                      : ""
                                  }
                                >
                                  {value}
                                  {!isAvailableWithCurrent && !isSelected && (
                                    <span className="ml-1 sm:ml-2 text-xs inline-block">
                                      ⊘
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 space-y-4 sm:space-y-5 lg:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || !isCombinationValid}
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="w-14 sm:w-16 lg:w-20 text-center font-bold text-lg sm:text-xl lg:text-2xl bg-gray-50 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl border-2 border-gray-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(stockCount, q + 1))
                      }
                      disabled={quantity >= stockCount || !isCombinationValid}
                      aria-label="Increase quantity"
                      title="Increase quantity"
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>
                  {isCombinationValid && stockCount > 0 && stockCount <= 10 && (
                    <div className="text-center text-orange-600 text-xs sm:text-sm font-medium bg-orange-50 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg">
                      ⚡ Only {stockCount} left - order soon!
                    </div>
                  )}
                </div>
                <button
                  onClick={addingtocart}
                  disabled={
                    isAddingToCart || stockCount === 0 || !isCombinationValid
                  }
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl lg:hover:shadow-2xl active:scale-[0.98] disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg sm:shadow-xl text-sm sm:text-base lg:text-lg"
                >
                  {isAddingToCart ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </span>
                  ) : stockCount === 0 ? (
                    "Out of Stock"
                  ) : !isCombinationValid ? (
                    "Select Options"
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                  Product Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Product?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 active:bg-red-800 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
