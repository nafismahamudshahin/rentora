import CustomerReviews from "@/components/home/CustomerReviews"
import FeaturedEquipment from "@/components/home/FeaturedEquipment"
import { HeroBanner } from "@/components/home/HeroBanner"
import HowItWorks from "@/components/home/HowItWorks"
import WhyChooseUs from "@/components/home/WhyChooseUs"

const HomePage = () => {
  return (
    <main>
      <HeroBanner />
      <FeaturedEquipment />
      <HowItWorks />
      <WhyChooseUs />
      <CustomerReviews />
    </main>
  )
}

export default HomePage
