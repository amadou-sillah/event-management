import { motion } from "framer-motion";
import { Library, BookOpen, Sparkles, Clock } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

export default function LibraryPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="text-muted-foreground">Manage your event assets, templates, and resources</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-purple-500/30">
          <Sparkles className="w-4 h-4 mr-2" />
          Coming Soon
        </Button>
      </motion.div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">Templates</h3>
              <p className="text-sm text-muted-foreground">
                Pre-designed event templates to get you started quickly.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <Library className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">Assets</h3>
              <p className="text-sm text-muted-foreground">
                Store logos, images, and documents for your events.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold">History</h3>
              <p className="text-sm text-muted-foreground">
                View past events, analytics, and historical data.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Coming Soon Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-300">
              🚀 Library Features Coming Soon
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              We're building a powerful library to help you manage all your event resources in one place.
              Stay tuned!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}