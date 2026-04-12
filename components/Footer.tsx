export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">അൽ ജലാൽ</h3>
            <p className="text-gray-400 text-sm">
              JASIA STUDENTS UNION OF JAMIA JALALIYYA MUNDAKKULAM
            </p>
            <p className="text-gray-400 text-sm mt-2">
              A platform for student voices, celebrating creativity and excellence in writing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/submit" className="hover:text-white transition-colors">Submit Article</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">Login</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm">
              For questions or support, contact your school administrator.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} അൽ ജലാൽ - JASIA Students Union of Jamia Jalaliyya Mundakkulam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
