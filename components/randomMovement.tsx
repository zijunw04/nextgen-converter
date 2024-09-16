import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const getRandomPosition = () => {
  return {
    x: Math.random() * 400 - 200,
    y: Math.random() * 400 - 200,
  };
};

const RandomSvgAnimation = () => {
  const [svg1Position, setSvg1Position] = useState(getRandomPosition());
  const [svg2Position, setSvg2Position] = useState(getRandomPosition());
  const [svg3Position, setSvg3Position] = useState(getRandomPosition());

  useEffect(() => {
    const interval = setInterval(() => {
      setSvg1Position(getRandomPosition());
      setSvg2Position(getRandomPosition());
      setSvg3Position(getRandomPosition());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute  inset-0 flex justify-center items-center pointer-events-none z-50">
      <motion.img
        className="absolute"
        src="/images/file1.png"
        alt="SVG 1"
        animate={svg1Position}
        transition={{ duration: 5, ease: "easeInOut" }}
        style={{ width: 100, height: 100, top: "20%", left: "70%" }}
      />

      <motion.img
        className="absolute"
        src="/images/file2.png"
        alt="SVG 2"
        animate={svg2Position}
        transition={{ duration: 5, ease: "easeInOut" }}
        style={{ width: 100, height: 100, top: "70%", right: "20%" }}
      />

      <motion.img
        className="absolute"
        src="/images/file3.png"
        alt="SVG 3"
        animate={svg3Position}
        transition={{ duration: 5, ease: "easeInOut" }}
        style={{ width: 100, height: 100, top: "45%", right: "80%" }}
      />
    </div>
  );
};

export default RandomSvgAnimation;
