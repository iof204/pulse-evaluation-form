export type ResultLevel = "strong" | "building" | "needs-love";
export type PerspectiveKey =
  | "all-strong"
  | "strong-overall"
  | "strong-with-gaps"
  | "building"
  | "mixed"
  | "several-needs-love";
export type ResultSectionKey =
  | "brand"
  | "audience"
  | "goals"
  | "journey"
  | "campaign"
  | "mix"
  | "retention";

type Snapshot = {
  label: string;
  seeing: string;
  matters: string;
};

export type ResultSectionDefinition = {
  key: ResultSectionKey;
  name: string;
  questionIds: number[];
  reminder: string;
  snapshots: Record<ResultLevel, Snapshot>;
};

export const resultSections: ResultSectionDefinition[] = [
  {
    key: "brand",
    name: "Brand & Messaging",
    questionIds: [4, 5],
    reminder:
      "How clearly and consistently your business comes across wherever people encounter it.",
    snapshots: {
      strong: {
        label: "Strong Foundation",
        seeing:
          "Your business appears to have a recognizable message and brand presence across the different ways people encounter you. Even when the creative or wording changes, the core identity still seems to come through.",
        matters:
          "When your message feels consistent, people are more likely to understand what you offer, remember your business, and build trust faster.",
      },
      building: {
        label: "Building Momentum",
        seeing:
          "Your brand and message seem to be doing part of the job, but they may not land with the same clarity everywhere. In some places, your value may come across more strongly than in others.",
        matters:
          "When your message shifts too much from one place to another, potential customers may understand bits and pieces of your business without fully connecting the bigger picture.",
      },
      "needs-love": {
        label: "Needs a Little Love",
        seeing:
          "Your marketing may be creating different impressions of your business depending on where someone encounters you. The core message, brand cues, or overall feel may not be connected enough for people to easily recognize and understand the bigger picture.",
        matters:
          "When the message and brand experience feel disconnected, people may have to work harder to understand what you offer, remember your business, or build confidence in it.",
      },
    },
  },
  {
    key: "audience",
    name: "Audience Understanding",
    questionIds: [6, 7],
    reminder:
      "How clearly your marketing is shaped around the people you most want to reach.",
    snapshots: {
      strong: {
        label: "Strong Foundation",
        seeing:
          "You appear to have a clear sense of who your primary audience is and what matters most to them. Your marketing seems to be shaped with that customer in mind.",
        matters:
          "When your audience is clear, your marketing is more likely to feel relevant, timely, and easier for the right people to connect with. It’s the classic marketing principle of delivering the right message to the right audience at the right time.",
      },
      building: {
        label: "Building Momentum",
        seeing:
          "You likely know your audience on a general level, but your focus may stretch across multiple groups or rely on assumptions more than direct insight.",
        matters:
          "When the audience focus is a little broad, your marketing can still work, but it may not speak as directly or as powerfully as it could.",
      },
      "needs-love": {
        label: "Needs a Little Love",
        seeing:
          "Your marketing may be trying to speak to a broad audience without enough clarity around who matters most or may be shaped more by what the business needs to say than by what customers are actually telling you.",
        matters:
          "When audience focus and customer insight are limited, messaging can become broader and easier to overlook, making it harder for the right person to immediately recognize, “This is for me.”",
      },
    },
  },
  {
    key: "goals",
    name: "Goals & Purpose",
    questionIds: [8, 9],
    reminder:
      "How intentionally your marketing is connected to what you want it to accomplish.",
    snapshots: {
      strong: {
        label: "Strong Foundation",
        seeing:
          "Your marketing seems to have a clear job to do. There appears to be intention behind what you are putting out and a sense of what you want it to accomplish.",
        matters:
          "When marketing has a defined purpose, it becomes easier to choose the right messages, channels, and actions instead of just staying busy.",
      },
      building: {
        label: "Building Momentum",
        seeing:
          "You likely have important goals in mind, but the purpose behind individual marketing efforts may not always be fully defined, prioritized, or connected.",
        matters:
          "When the goal behind the marketing is a little fuzzy, it becomes harder to tell whether the effort is truly moving the business forward.",
      },
      "needs-love": {
        label: "Needs a Little Love",
        seeing:
          "Your marketing may be driven more by immediate needs, urgency, or “what has to go out next” than by one clear business objective.",
        matters:
          "Without a defined purpose, marketing can start to feel like a series of disconnected tasks instead of a tool that is actively supporting growth.",
      },
    },
  },
  {
    key: "journey",
    name: "Customer Experience & Journey",
    questionIds: [10, 11],
    reminder:
      "How easily people can understand your business and move from interest to action.",
    snapshots: {
      strong: {
        label: "Strong Foundation",
        seeing:
          "Customers appear to be able to understand the basics of your business and move forward without too much extra explanation. You also seem to have a good sense of where questions or hesitation tend to happen along the way.",
        matters:
          "Understanding both how customers move forward and where they may lose momentum gives you a clearer picture of the experience your marketing is creating.",
      },
      building: {
        label: "Building Momentum",
        seeing:
          "The customer experience appears to be mostly working, but there may be a few areas where people hesitate, need clarification, or require a little extra guidance.",
        matters:
          "Those moments of friction can quietly slow down decisions or action, especially when the customer is interested but not fully confident about what to do next.",
      },
      "needs-love": {
        label: "Needs a Little Love",
        seeing:
          "Customers may regularly need extra explanation to understand the offer or know what to do next, while the points where people hesitate or lose momentum may not always be easy to identify.",
        matters:
          "When the path forward is unclear, and you are not sure where the friction is happening, potential customers can lose momentum before taking the next step.",
      },
    },
  },
  {
    key: "campaign",
    name: "Campaign Planning & Visibility",
    questionIds: [12, 13],
    reminder:
      "How intentionally you plan when, where, and why your business shows up.",
    snapshots: {
      strong: {
        label: "Strong Foundation",
        seeing:
          "Your marketing visibility appears to be intentional. Whether your approach is ongoing, seasonal, campaign-based, or tied to business cycles, it seems to be guided by a plan.",
        matters:
          "Intentional visibility helps your marketing feel more purposeful and gives your business a stronger chance to build awareness and momentum over time.",
      },
      building: {
        label: "Building Momentum",
        seeing:
          "You are showing up, but some of your marketing may be decided closer to the moment or built around immediate needs rather than a consistent plan.",
        matters:
          "This can still get the job done, but it can make marketing feel harder to sustain, more overwhelming to manage, and more difficult to learn from over time.",
      },
      "needs-love": {
        label: "Needs a Little Love",
        seeing:
          "Your visibility may be relying too heavily on urgency; showing up mostly when something needs attention, sales are slower, or there is something specific to push.",
        matters:
          "When marketing becomes mostly reactive, it is harder to build steady awareness and harder to know what is truly working versus what is simply urgent.",
      },
    },
  },
  {
    key: "mix",
    name: "Marketing Mix & Measurement",
    questionIds: [16, 17],
    reminder:
      "How well your marketing activities work together and help you learn what is working.",
    snapshots: {
      strong: {
        label: "Strong Foundation",
        seeing:
          "The different parts of your marketing seem to have a purpose, and you appear to have a workable way of evaluating whether those efforts are helping the business.",
        matters:
          "When the different parts of your marketing have a clear role and work together intentionally, it becomes easier to see how they support the business. Reviewing the results then helps you make more informed decisions about what is worth repeating, adjusting, or rethinking.",
      },
      building: {
        label: "Building Momentum",
        seeing:
          "You are using multiple marketing channels or activities, but the role each one plays may not always feel fully connected to the bigger picture, and it may still be difficult to tell which efforts are truly helping the business.",
        matters:
          "When the different parts of your marketing have a clear role and work together intentionally, it becomes easier to understand how they support the business. Reviewing the results then helps you make more informed decisions about what to continue, adjust, or rethink.",
      },
      "needs-love": {
        label: "Needs a Little Love",
        seeing:
          "Your marketing may include separate channels or activities without enough clarity around how they fit together or which ones are truly helping the business.",
        matters:
          "Without a clear role for each effort and a way to learn from the results, it can be harder to know what is worth continuing, adjusting, or rethinking.",
      },
    },
  },
  {
    key: "retention",
    name: "Customer Action & Retention",
    questionIds: [18, 19],
    reminder:
      "How well your business turns interest into action — and stays connected after someone becomes a customer.",
    snapshots: {
      strong: {
        label: "Strong Foundation",
        seeing:
          "Your business appears to have a reliable way to move interested customers forward and continue the relationship after the initial sale, visit, booking, or service.",
        matters:
          "Marketing does not stop once someone shows interest or even after they become a customer. Clear follow-through can help keep opportunities moving forward, while staying connected can strengthen relationships and create more potential for future business.",
      },
      building: {
        label: "Building Momentum",
        seeing:
          "Your follow-through generally seems to work, but some parts of the experience may depend on timing, manual effort, or who is handling the interaction. Staying connected after someone becomes a customer may also happen less consistently.",
        matters:
          "When follow-through is inconsistent, interested customers can lose momentum before taking the next step, and existing customer relationships may become quieter than intended after the initial transaction.",
      },
      "needs-love": {
        label: "Needs a Little Love",
        seeing:
          "Some opportunities may be losing momentum between initial interest and the next step, while the relationship with existing customers may also become quieter once the initial purchase, visit, booking, or service is complete.",
        matters:
          "Marketing does not stop once someone shows interest, or even after they become a customer. Clear follow-through can help keep opportunities moving forward, while staying connected can strengthen relationships and create more potential for future business.",
      },
    },
  },
];

export const perspectiveCopy = {
  "all-strong":
    "Your results show a strong foundation across the areas we reviewed. The opportunity now is less about fixing gaps and more about continuing to refine, learn, and build on what is already working.",
  "strong-overall":
    "You have a lot of strong pieces working for you. At this stage, your biggest opportunity may be less about adding more marketing and more about making sure what you already have continues to stay connected to your goals.",
  "strong-with-gaps":
    "You have a strong base to build from, with a few areas that may deserve a closer look. Those smaller gaps can sometimes make the rest of your marketing feel harder than it needs to be.",
  building:
    "There are good pieces in motion, but some may not be fully connected yet. That can make marketing feel busier or more overwhelming than it needs to be — even when you are doing a lot of things right.",
  mixed:
    "Your results show a mix of strong areas and places that may need more clarity or attention. Looking at how those pieces affect one another can help reveal where the biggest opportunities may be.",
  "several-needs-love":
    "A few parts of your marketing may be asking for more attention right now. That does not mean everything needs to be fixed at once — identifying the gaps is the first step toward figuring out what actually deserves your energy.",
} as const;

export const detailedPerspectiveCopy: Record<PerspectiveKey, string[]> = {
  "all-strong": [
    "Your results suggest that you have a strong marketing foundation across the areas we reviewed. That does not mean there is nothing left to improve — marketing should continue to evolve alongside your business, customers, and goals.",
    "At this stage, the opportunity is less about correcting gaps and more about continuing to refine, test, learn, and build on what is already working.",
    "Keep the momentum going.",
  ],
  "strong-overall": [
    "Your results suggest that you have a solid marketing foundation in place. The different parts of your marketing appear to be working with intention, and you have several strong areas to continue building from.",
    "The opportunity now is less about “fixing” your marketing and more about refining what is already working, staying connected to your goals, and making sure your marketing continues to evolve as the business grows.",
  ],
  "strong-with-gaps": [
    "You have a lot of good pieces in place. Your results suggest that the foundation is there, but a few areas may not be working as intentionally or consistently as the rest.",
    "That matters because even one or two disconnected pieces can make marketing feel harder than it needs to be. The good news is that you are not starting from scratch — you already have strengths to build from.",
  ],
  building: [
    "Your results suggest that your marketing is moving in the right direction, but some of the pieces may not be fully connected yet.",
    "You are likely doing a number of things that are working. The bigger opportunity is creating more clarity around how those efforts support one another, what deserves your attention, and what is actually helping move the business forward.",
    "This is often where marketing can start to feel busy or overwhelming: there is activity, but the bigger picture can be harder to see.",
  ],
  mixed: [
    "Your results show a bit of a mixed picture — and that is not necessarily a bad thing. Some parts of your marketing appear to have a strong foundation, while others may need more clarity, connection, or attention.",
    "Rather than looking at this as a list of things to fix, it may be more useful to look at how the different pieces are affecting one another. Strengthening one or two key areas may help other parts of your marketing work more effectively too.",
  ],
  "several-needs-love": [
    "Your results suggest that several parts of your marketing may be working independently, reactively, or without as much clarity as you would like.",
    "That does not mean you need to overhaul everything at once. In fact, trying to tackle every area at the same time can make marketing feel even more overwhelming. A more useful starting point is identifying which areas may be creating the biggest gaps and focusing your attention there first.",
  ],
};
