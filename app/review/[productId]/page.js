"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import LoadingScreen from '@/components/LoadingScreen';
import { useState, use, useEffect } from 'react';

// Mock data - in production, this would come from your API/database


// const filteredreviews = [
//     {
//         _id: "rev001",
//         userId: {
//             _id: "user001",
//             name: "Sarah Mitchell",
//             avatar: "SM"
//         },
//         productId: "691f5fb91ec6dcc804ad9bd9",
//         rating: 5,
//         title: "Best Noise Cancellation I've Ever Experienced",
//         comment: "I've been using these headphones for my daily commute for two months now, and they're absolutely phenomenal. The noise cancellation is industry-leading - I can barely hear the subway trains anymore. The sound quality is crisp and balanced, perfect for both music and podcasts. Battery life easily lasts me a full week of daily use. The multipoint connection works flawlessly between my laptop and phone. Completely worth the investment for anyone who values audio quality and peace.",
//         images: [],
//         verified: true,
//         status: "approved",
//         helpfulCount: 89,
//         createdAt: "2024-09-15T14:22:00Z"
//     },
//     {
//         _id: "rev002",
//         userId: {
//             _id: "user002",
//             name: "James Anderson",
//             avatar: "JA"
//         },
//         productId: "691f5fb91ec6dcc804ad9bd9",
//         rating: 5,
//         title: "Premium Quality for Professionals",
//         comment: "As a music producer, I'm very particular about audio equipment. The WH-1000XM5 delivers exceptional sound clarity with LDAC codec support. The frequency response is well-balanced, and the noise cancellation doesn't affect the audio quality like some competitors. Comfort is outstanding - I wear these for 8+ hour sessions without discomfort. The speak-to-chat feature is genius for quick conversations. Only minor downside is they don't fold as compactly as the previous model.",
//         images: [],
//         verified: true,
//         status: "approved",
//         helpfulCount: 67,
//         createdAt: "2024-10-02T09:45:00Z"
//     },
//     {
//         _id: "rev003",
//         userId: {
//             _id: "user003",
//             name: "Maria Garcia",
//             avatar: "MG"
//         },
//         productId: "691f5fb91ec6dcc804ad9bd9",
//         rating: 4,
//         title: "Excellent, But Pricey",
//         comment: "These are my first premium headphones, and I'm impressed. The noise cancellation is incredible - perfect for open office environments. Sound quality is excellent for casual listening, though audiophiles might want something more neutral. The 30-hour battery life claim is accurate. My only complaints are the high price point and the case feels a bit bulky for travel. Still, the comfort and performance make them worth considering if you're in the market for premium wireless headphones.",
//         images: [],
//         verified: true,
//         status: "approved",
//         helpfulCount: 52,
//         createdAt: "2024-10-18T16:30:00Z"
//     },
//     {
//         _id: "rev004",
//         userId: {
//             _id: "user004",
//             name: "David Chen",
//             avatar: "DC"
//         },
//         productId: "691f5fb91ec6dcc804ad9bd9",
//         rating: 5,
//         title: "Perfect for Frequent Travelers",
//         comment: "I fly internationally twice a month, and these headphones have been a game-changer. The noise cancellation makes long flights so much more bearable - engine noise just disappears. The battery lasts multiple flights without charging. Comfort is exceptional even on 12+ hour flights. The quick attention mode is perfect for flight attendant interactions. The carry case is well-designed and protective. If you travel frequently, these are absolutely worth every penny.",
//         images: [],
//         verified: true,
//         status: "approved",
//         helpfulCount: 45,
//         createdAt: "2024-11-01T11:15:00Z"
//     },
//     {
//         _id: "rev005",
//         userId: {
//             _id: "user005",
//             name: "Emily Roberts",
//             avatar: "ER"
//         },
//         productId: "691f5fb91ec6dcc804ad9bd9",
//         rating: 5,
//         title: "Upgraded from XM4 - Worth It",
//         comment: "I owned the XM4 and debated whether to upgrade. The XM5 is noticeably better in every way. Noise cancellation is improved, especially with wind noise. The new design is more comfortable for extended wear - the lighter weight makes a difference. Sound quality has a cleaner, more refined profile. Call quality is significantly better thanks to the improved microphones. The app integration works smoothly with customizable EQ settings. Highly recommend the upgrade if you're on the fence.",
//         images: [],
//         verified: true,
//         status: "approved",
//         helpfulCount: 38,
//         createdAt: "2024-11-08T13:50:00Z"
//     },
//     {
//         _id: "rev006",
//         userId: {
//             _id: "user006",
//             name: "Michael Thompson",
//             avatar: "MT"
//         },
//         productId: "691f5fb91ec6dcc804ad9bd9",
//         rating: 4,
//         title: "Great Headphones with Minor Quirks",
//         comment: "Overall very satisfied with these headphones. Sound quality is fantastic, noise cancellation works brilliantly, and they're incredibly comfortable. The adaptive sound control adjusts automatically based on your environment which is convenient. However, I've noticed occasional Bluetooth connectivity hiccups with my Windows laptop. The touch controls take some getting used to, and I sometimes trigger them accidentally. Despite these minor issues, they're still an excellent choice for premium wireless headphones.",
//         images: [],
//         verified: false,
//         status: "approved",
//         helpfulCount: 29,
//         createdAt: "2024-11-15T10:20:00Z"
//     }
// ];

export default function ReviewsPage({ params }) {
    const productId = decodeURIComponent(use(params).productId);
    const [sortBy, setSortBy] = useState('recent');
    const [filterRating, setFilterRating] = useState('all');
    const [matchedItem, setmatchedItem] = useState([])
    const [filteredreviews, setfilteredreviews] = useState([])
    const [avgrating, setavgrating] = useState(0)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    useEffect(() => {
        (async () => {
            const product = await fetch("/api/products")
            const response = await product.json()
            const mathceditem = response.filter(i => i.productid === productId)
            setmatchedItem(mathceditem)
            console.log("matched item", mathceditem)

            const reviews = await fetch("/api/review")
            const reviewResponse = await reviews.json()
            const filteredReviews = reviewResponse.filter(r => r.productId === productId);
            setfilteredreviews(filteredReviews);
            setavgrating(filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length);

        })()
    }, [productId]);

    const renderStars = (rating, size = 'text-lg') => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`${size} text-yellow-500`}>
                        {star <= fullStars ? '★' : (star === fullStars + 1 && hasHalfStar ? '★' : '☆')}
                    </span>
                ))}
            </div>
        );
    };
    if (matchedItem.length !== 1) {
        return <LoadingScreen message="Loading reviews..." />;
    }
    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        filteredreviews.forEach(review => {
            distribution[review.rating]++;
        });
        return distribution;
    };

    const ratingDistribution = getRatingDistribution();
    // const displayImage = matchedItem?.variants[0].images[0] 
    // console.log("display image", displayImage);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {/* Header */}
                <div className="bg-white border-b-2 border-blue-600 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {/* Product Summary */}
                    {matchedItem.map(item => (
                        <div key={item._id} className="bg-white border-2 border-blue-200 rounded-lg shadow-sm p-6 mb-8">
                            <div className="flex  sm:flex-row gap-6 items-start">
                                <Image
                                    width={500} height={500}
                                    src={(() => {
                                        const productImage = item?.variants?.[0]?.images?.[0];
                                        const productSlug = item?.name?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                                        return productImage || `/uploads/products/${productSlug}.png`;
                                    })()}
                                    alt={item.name}
                                    priority
                                    className="  rounded-lg border-2 border-gray-200"
                                    unoptimized={!item?.variants?.[0]?.images?.[0]?.startsWith('http')}
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-blue-600 font-semibold mb-1 uppercase">{item.brand}</p>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
                                    <p className="text-gray-600  text-lg mb-4 line-clamp-2">{item.description}</p>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            {renderStars(avgrating)}
                                            <span className="text-2xl font-bold text-gray-900">{avgrating.toFixed(1)}</span>
                                            <span className="text-gray-600">out of 5</span>
                                        </div>
                                    </div>

                                    {item.variants[0]?.salePrice && (
                                        <div className="mt-4 flex items-baseline gap-3">
                                            <span className="text-2xl font-bold text-blue-600">${item.variants[0].salePrice.toFixed(2)}</span>
                                            <span className="text-lg text-gray-500 line-through">${item.variants[0].price.toFixed(2)}</span>
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">SALE</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>))}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar - Rating Distribution */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm p-6 sticky top-4">
                                <h3 className="font-bold text-lg text-gray-900 mb-4">Rating Breakdown</h3>
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = ratingDistribution[rating];
                                    const percentage = filteredreviews.length > 0 ? (count / filteredreviews.length) * 100 : 0;
                                    return (
                                        <div key={rating} className="flex items-center gap-3 mb-3">
                                            <span className="text-sm font-semibold text-gray-700 w-12">{rating} star</span>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 w-8 text-right">{count}</span>
                                        </div>
                                    );
                                })}


                            </div>
                        </div>

                        {/* Main Content - Reviews List */}
                        <div className="lg:col-span-3">
                            {/* Filters */}
                            {/* <div className="bg-white border-2 border-blue-200 rounded-lg shadow-sm p-4 mb-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full border-2 border-blue-200 rounded-lg px-4 py-2.5 text-gray-700 bg-white focus:outline-none focus:border-blue-600 transition-colors"
                                    >
                                        <option value="recent">Most Recent</option>
                                        <option value="helpful">Most Helpful</option>
                                        <option value="highest">Highest Rating</option>
                                        <option value="lowest">Lowest Rating</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Rating</label>
                                    <select
                                        value={filterRating}
                                        onChange={(e) => setFilterRating(e.target.value)}
                                        className="w-full border-2 border-blue-200 rounded-lg px-4 py-2.5 text-gray-700 bg-white focus:outline-none focus:border-blue-600 transition-colors"
                                    >
                                        <option value="all">All Ratings</option>
                                        <option value="5">5 Stars Only</option>
                                        <option value="4">4 Stars & Up</option>
                                        <option value="3">3 Stars & Up</option>
                                        <option value="2">2 Stars & Up</option>
                                        <option value="1">1 Star & Up</option>
                                    </select>
                                </div>
                            </div>
                        </div> */}

                            {/* Reviews Count */}
                            <div className="mb-4">
                                <p className="text-gray-700 font-medium">total {filteredreviews.length} reviews</p>
                            </div>

                            {/* Reviews */}
                            <div className="space-y-4">
                                {filteredreviews.map((review) => (
                                    <div key={review._id} className="bg-white border-2 border-blue-100 rounded-lg shadow-sm p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                        {/* Review Header */}
                                        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                                    {review.userId.avatar}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="font-bold text-gray-900">{review.userId.name}</h4>
                                                        {review.verified && (
                                                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded border border-blue-200">
                                                                ✓ Verified Purchase
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(review.createdAt)}</p>
                                                </div>
                                            </div>
                                            {renderStars(review.rating, 'text-xl')}
                                        </div>

                                        {/* Review Content */}
                                        <h3 className="font-bold text-xl text-gray-900 mb-3">{review.title}</h3>
                                        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                                        {/* Review Footer */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                                            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                                                <span className="text-lg">👍</span>
                                                <span className="text-sm font-medium">Helpful ({review.helpfulCount})</span>
                                            </button>
                                            <button className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
                                                Report
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}