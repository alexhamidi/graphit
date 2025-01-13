import { useState, useEffect } from "react";
import { post } from "../networking";
import { DEFAULT_BOX_ACTIVE, AI_ERROR } from "../constants";
import { BoxActive, Graph } from "../interfaces";
import Box from "../components/Box";

interface Props {
  setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
  handleAddGraph: (graph: Graph) => void;
  canvasRect: DOMRect | null;
  handleSetError: (message: string) => void;
}

export default function AiBox({
  setBoxActive,
  handleAddGraph,
  canvasRect,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("loading");
  const quotes = [
    "If a man'’'s mind becomes pure, his surroundings will also become pure. - Buddha",
    "Life is a series of natural and spontaneous changes. Don't resist them; that only creates sorrow. Let reality be reality. Let things flow naturally forward in whatever way they like. - Lao-Tzu",
    "The only true wisdom is in knowing you know nothing. - Socrates",
    "No one saves us but ourselves. No one can and no one will. We ourselves must walk the path. - Buddha",
    "Nothing is ever said that has not been said before. - Terence",
    "Avarice and luxury, those evils which have been the ruin of every great state. - Livy",
    "Better to be wise by the misfortunes of others than by your own. - Aesop",
    "In our play we reveal what kind of people we are. - Ovid",
    "Short is the joy that guilty pleasure brings. - Euripides",
    "Without feelings of respect, what is there to distinguish men from beasts? - Confucius",
    "Men seek retreats for themselves - in the country, by the sea, in the hills - and you yourself are particularly prone to this yearning. But all this is quite unphilosophic, when it is open to you, at any time you want, to retreat into yourself. No retreat offers someone more quiet and relaxation than that into his own mind. - Marcus Aurelius",
    "Time is the wisest counselor of all. - Pericles",
    "When I let go of what I am, I become what I might be. - Lao-Tzu",
    "Glory ought to be the consequence, not the motive of our actions. - Pliny the Younger",
    "Lust for power is the most flagrant of all the passions. - Tacitus",
    "Prefer a loss to a dishonest gain: the one brings pain for a moment, the other for all time. - Chilon of Sparta",
    "We are what we repeatedly do. Excellence then, is not an act, but a habit. - Aristotle",
    "People in their handling of affairs often fail when they are about to succeed. If one remains as careful at the end as he was at the beginning, there will be no failure. - Lao-Tzu",
    "They can conquer who believe they can. - Virgil",
    "Small opportunities are often the beginning of great enterprises. - Demosthenes",
    "When you are inspired by some great purpose, some extraordinary project, all your thoughts break their bonds. - Patanjali",
    "All things will be produced in superior quantity and quality, and with greater ease, when each man works at a single occupation, in accordance with his natural gifts, and at the right moment, without meddling with anything else. - Plato",
    "Whoever walks with the wise will become wise, but the companion of fools suffers harm. - Solomon",
    "Good character is not formed in a week or a month. It is created little by little, day by day. Protracted and patient effort is needed to develop good character. - Heraclitus of Ephesus",
    "Waste no more time arguing about what a good man should be. Be one. - Marcus Aurelius",
    "Do not say a little in many words, but a great deal in few. - Pythagoras",
    "Difficulties strengthen the mind as labor does the body. - Seneca the Younger",
    "A room without books is like a body without a soul. - Marcus Tullius Cicero",
    "Friends show their love in times of trouble, not in happiness. - Euripides",
    "One of the most beautiful qualities of true friendship is to understand and to be understood. - Seneca the Younger",
    "Love your enemies, do good to them that hate you, bless them that curse you, and pray for them that despitefully use you. - Jesus Christ",
    "Love is composed of a single soul inhabiting two bodies. - Aristotle",
    "There is no duty more obligatory than the repayment of kindness. - Marcus Tullius Cicero",
    "Enjoy life with the woman whom you love all the days of your fleeting life which He has given to you under the sun; for this is your reward, - Solomon",
    "Every heart sings a song, incomplete, until another heart whispers back. Those who wish to sing always find a song. At the touch of a lover, everyone becomes a poet. - Plato",
    "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage. - Lao-Tzu",
    "One word frees us of all the weight and pain in life, that word is Love. - Sophocles",
    "Fortune and love favor the brave. - Ovid",
    "Happiness resides not in possessions, and not in gold, happiness dwells in the soul. - Democritus",
    "The more man meditates upon good thoughts, the better will be his world and the world at large. - Confucius",
    "The happy man is the one who has a healthy body, a wealthy soul and a well-educated nature. - Thales of Miletus",
    "True happiness is… to enjoy the present without anxious dependence on the future. - Seneca the Younger",
    "Happiness and freedom begin with one principle. Some things are within your control, and some are not. - Epictetus",
    "Happy is the man who has broken the chains which hurt the mind and has given up worrying once and for all. - Ovid",
    "The greatest blessings of mankind are within us and within our reach. A wise man is content with his lot, whatever it may be, without wishing for what he has not. - Seneca the Younger",
    "If you are depressed, you are living in the past. If you are anxious, you are living in the future. If you are at peace, you are living in the present. - Lao-Tzu",
    "He is a wise man who does not grieve for the things which he has not but rejoices for those which he has. - Epictetus",
    "Do not train a child to learn by force or harshness; but direct them to it by what amuses their minds, so that you may be better able to discover with accuracy the peculiar bent of the genius of each. - Plato",
    "Good people do not need laws to tell them to act responsibly, while bad people will find a way around the laws. - Plato",
    "In politics we presume that everyone who knows how to get votes knows how to administer a city or a state. When we are ill... we do not ask for the handsomest physician, or the most eloquent one. - Plato",
    "The biggest risk is not taking any risk... In a world that changing really quickly, the only strategy that is guaranteed to fail is not taking risks. - Mark Zuckerberg",
    "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough. - Mark Zuckerberg"
  ]


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessage((prev) => {
          if (prev === "loading...") return "loading";
          return prev + ".";
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const [displayed, setDisplayed] = useState<string | null>(null)
  const handleAiSubmit = async (e: React.FormEvent) => {
    setError("");
    e.preventDefault();
    const currPrompt: string = prompt;
    setPrompt("");
    if (currPrompt === "") {
      setError("Please provide a prompt");
      return;
    }
    try {
      setLoading(true);
      setDisplayed(quotes[Math.floor(Math.random() * quotes.length)])
      const response = await post("/ai", {
        prompt: currPrompt,
        width: canvasRect!.width,
        height: canvasRect!.height,
      });
      const graph: Graph = response.data.graph;
      handleAddGraph(graph);
      setLoading(false);
      setBoxActive({ ...DEFAULT_BOX_ACTIVE, aiBox: false });
    } catch (err) {
      setLoading(false);
      setError(AI_ERROR);
    }
    setPrompt("");
  };

  return (
    <Box
      mainText={"create a new graph using AI"}
      placeholderText={"enter prompt here"}
      closeFunction={() =>
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, aiBox: false })
      }
      submitFunction={handleAiSubmit}
      inputValue={prompt}
      inputChangeFunction={setPrompt}
      error={error}
      loading={loading}
      loadingMessage={loadingMessage}
      containsPrimaryInput={true}
      children={loading ? <div className="quote">
        {displayed}
      </div> : null}
    />
  );
}
