// "use client";
// import { useEffect, useState } from "react";

// export default function PostPage() {
//   const [images, setImages] = useState([]);

//   useEffect(() => {
//     const fetchImages = async () => {
//       const res = await fetch("https://dummyjson.com/products/1");
//       const data = await res.json();
//       setImages(data.images);
//     };

//     fetchImages();
//   }, []);

//   return (
//     <main>
//       <h1>Multiple Images</h1>

//       {images.map((img, index) => (
//         <img
//           key={index}
//           src={img}
//           alt="product"
//           width={200}
//           style={{ margin: "10px" }}
//         />
//       ))}
//     </main>
//   );
// }
