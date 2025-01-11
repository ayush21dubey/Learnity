import Image from 'next/image'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Trophy, Search } from 'lucide-react'

const popularCourses = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
    instructor: 'Jane Doe',
    students: 1500,
    image: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '2',
    title: 'Data Science Fundamentals',
    description: 'Explore the world of data analysis, machine learning, and statistical modeling.',
    instructor: 'John Smith',
    students: 1200,
    image: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '3',
    title: 'Digital Marketing Mastery',
    description: 'Master the art of online marketing, SEO, and social media strategies.',
    instructor: 'Emily Brown',
    students: 980,
    image: '/placeholder.svg?height=200&width=300'
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 animate-fade-in-down">Welcome to Learnity</h1>
          <p className="text-xl mb-8 animate-fade-in-up">Discover, Learn, and Grow with Our Online Courses</p>
          <Link href="/login">
            <Button size="lg" className="animate-bounce">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 relative">
          <Input
            type="text"
            placeholder="Search for courses..."
            className="w-full max-w-md pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Popular Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map(course => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={300}
                    height={200}
                    className="rounded-t-lg"
                  />
                  <CardTitle className="mt-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                    <div>{course.instructor}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">Learn More</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center mb-12">
          <Link href="/courses">
            <Button size="lg">
              <BookOpen className="mr-2 h-4 w-4" />
              Explore All Courses
            </Button>
          </Link>
        </section>

        <section className="bg-gray-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Learnity?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full p-4 mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert-Led Courses</h3>
              <p className="text-gray-600">Learn from industry professionals and experienced instructors.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 rounded-full p-4 mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community Support</h3>
              <p className="text-gray-600">Engage with peers and instructors in our vibrant learning community.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-pink-100 rounded-full p-4 mb-4">
                <Trophy className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Earn Certificates</h3>
              <p className="text-gray-600">Gain recognition for your skills with our course certificates.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center">
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link href="/faq" className="text-gray-600 hover:text-gray-900">FAQ</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3 mb-4 md:mb-0 text-center">
              <Button variant="outline">
                Provide Feedback
              </Button>
            </div>
            <div className="w-full md:w-1/3 text-right">
              <Button variant="outline">
                <Trophy className="mr-2 h-4 w-4" />
                Support Learnity
              </Button>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-600">
            <p>&copy; 2023 Learnity. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

