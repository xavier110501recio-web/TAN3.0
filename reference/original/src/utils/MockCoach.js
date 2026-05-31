import { SYSTEM_PROMPT } from "../constants/systemPrompt";
import { ALTERNATIVE_MISSIONS } from "../data/alternativeMissions";
import { MISSIONS } from "../data/missions";

const completed = ["Done. Here's what's next.", "Day [streak] streak. Keep it moving.", "That task built something. Next:", "Good. Forward.", "[streak] days in. Most people stopped before this. You didn't. Next mission:", "Noted. Here's tomorrow's move:", "Clean. Next:", "That's the work. Here's more of it:"];
const partials = ["Partial counts. Finish this one before moving. A half-done mission does not compound. A done one does.", "You started. That is more than most. Finish it before moving forward.", "Almost is not done. Same mission. Smaller scope if needed. Here it is:"];
const obstacles = [
  [/time|busy|rushed|schedule/i, "Time pressure is real. Tomorrow's mission fits your window. Do it before the day fills up."],
  [/nervous|scared|awkward|uncomfortable|weird/i, "Discomfort means it's real. The next mission continues from exactly where you are."],
  [/no response|no reply|ignored|nothing|crickets/i, "No response is data, not failure. Tomorrow we adjust the approach or increase the volume."],
  [/confused|unclear|don't understand|lost/i, "If it felt unclear, do it again differently. Contact with the task matters more than perfection."],
  [/forgot|slipped|remember/i, "Set a reminder before you close this. Then do today's mission."],
  [/overwhelmed|too much|everything/i, "One mission. Not the whole business. Just this one thing. Here it is:"],
];

export function generateMissionDebrief(outcome, note, missionNumber, userProfile) {
  const mission = MISSIONS.find((m) => m.mission_number === missionNumber);
  const nextMission = outcome === "partial" ? mission : MISSIONS.find((m) => m.mission_number === missionNumber + 1) || null;
  let coachMessage = "";
  if (outcome === "partial") coachMessage = pick(partials, note);
  else if (outcome === "completed_with_issue") coachMessage = (obstacles.find(([rx]) => rx.test(note || ""))?.[1]) || "Something got in the way. That's the game. Tomorrow picks up from where you are.";
  else if (/sale|sold|paid|customer|client|dollar|revenue|\$/i.test(note || "")) coachMessage = `First sale. That's not luck. That's ${userProfile.current_day} days of showing up. Now we build on it.`;
  else coachMessage = pick(completed, `${note}${missionNumber}`).replaceAll("[streak]", String(userProfile.current_day));
  return { coachMessage: `${coachMessage}${nextMission ? ` ${formatMission(nextMission)}` : " The first sprint is complete. Take stock and set the next target."}`, nextMission, xpEarned: outcome === "partial" ? 0 : mission.xp, skillIncrement: { skillName: mission.skill, amount: outcome === "partial" ? 0 : 8 } };
}

export function generateCoachResponse(message, chatHistory, userProfile) {
  void SYSTEM_PROMPT;
  const name = userProfile?.name || "you";
  const daily = userProfile?.daily_time || "30 minutes";
  const blocker = userProfile?.blockers?.[0] || "overthinking";
  const mission = MISSIONS.find((m) => m.mission_number === userProfile?.current_day) || MISSIONS[0];
  const pools = [
    [/stuck|don't know how|confused|no idea|lost|what do i do/i, [`${name}, the specific problem is not the whole business. It is the next uncertain move. Open today's mission and do the smallest visible version of it before you touch anything else.`, `You are treating confusion like a stop sign. It is a work order. Write the one assumption you are making, then test it with one real person today.`, `Strip it down. Who has the problem, where are they, and what can you ask them today? Answer that and move.`]],
    [/scared|nervous|worried|fear|fail|failure/i, [`Fear is not instructions. The version of ${name} who gets the outcome is already doing the uncomfortable rep. Send the message anyway.`, `Name the realistic downside, not the dramatic one. Then do the task. The market cannot answer a question you never ask.`, `Nerves mean contact with something real. Keep the scope small and execute today's mission.`]],
    [/no time|busy|can't|too much|overwhelmed/i, [`You said you have ${daily}. Today's mission fits that window. What's in those minutes right now that matters more than this?`, `Overwhelmed means you are staring at the whole map. Stop. One mission. One timer. Start before the day fills up.`, `The business does not need your whole day. It needs the promised block done cleanly.`]],
    [/no money|broke|afford|funding|capital/i, [`The next moves cost nothing. A conversation costs nothing. A post costs nothing. What specifically requires money right now? Name it.`, `Money is not the first bottleneck here. Proof is. Get one real customer conversation before spending a dollar.`, `Build around zero budget. Revenue first, costs second.`]],
    [/motivation|motivated|give up|quitting|quit|stop|don't feel like/i, [`The version of you that has everything you want is already doing this. Which one are you being today? Open Mission ${mission.mission_number}.`, `Motivation is optional. The task is not. Do the first five minutes and let momentum catch up.`, `You do not need a better mood. You need a smaller start. Begin the mission now.`]],
    [/idea|good idea|viable|work|worth it/i, [`The market will tell you. No one knows if an idea is good until someone pays or gives real buying signal. Today's move gets you closer to that answer.`, `Your feelings about the idea are not evidence. A real conversation is evidence. Go get one.`, `Viability is not decided in your head. It is decided by the person with the problem.`]],
    [/first customer|first sale|clients|sell|selling|how do i sell/i, [`Selling is asking before pitching. Find the gap between where they are and where they want to be, then make a direct offer when the pain is clear.`, `Do not lead with features. Ask what they have tried, what failed, and what it costs them to stay there. Then sell the result.`, `Your next customer starts as a conversation. Send one specific message to one specific person today.`]],
    [/chatgpt|claude|better than|why not just use|why this/i, [`ChatGPT gives you answers. ${name}'s coach has read ${chatHistory?.length || 0} messages and knows your blocker is ${blocker}. ChatGPT will not ask tomorrow if the task got done.`]],
  ];
  const response = pools.find(([rx]) => rx.test(message))?.[1];
  return { response: pick(response || [`Okay. What's the specific problem right now? Not the whole business. Name the one constraint, then take the next action in Mission ${mission.mission_number}.`, `Bring it back to the next real action. For ${userProfile?.niche || "your niche"}, that means one market-facing move today.`, `No spiral. Identify the constraint, solve that one thing, and move.`], message) };
}

export function generatePlanSummary(userProfile) {
  const blockerMap = {
    "I don't know where to start": "The plan starts with one specific thing to do today. Not everything, one thing. The confusion disappears when the first move is clear.",
    "I don't have enough money": "The first 10 missions cost nothing. Make money before spending it. We build around what you have.",
    "I don't have enough time": "Every mission fits within your stated daily window. 15 minutes a day compounds into more than most people build in a year.",
    "I'm scared it won't work": "Every mission is a low-stakes experiment, not a high-stakes bet. Data over fear. The market will tell you what works.",
    "I keep overthinking everything": "One mission. No planning required. Complete what's in front of you and report back. That is the whole system.",
    "I've tried before and stopped": "You know more than someone who has never tried. This time the structure is different. One mission. One day.",
  };
  const outcome = {
    "Make my first dollar outside my job": "By Mission 30 you will have had real market conversations, a tested offer, and proof of whether people will pay for what you are building.",
    "Build a consistent side income": "By Mission 30 you will have a validated offer, early customers, and a repeatable process for finding more.",
    "Replace my full-time income": "By Mission 30 you will have the foundation: validated offer, early customers, and a clear path to the revenue number that replaces your salary.",
    "Launch my business publicly": "By Mission 30 you will have gone from idea to live with real feedback and data about what to build next.",
    "Get complete clarity on what I'm building": "By Mission 30 you will know what your business is, who it is for, and the fastest path to your first dollar.",
  };
  return {
    phaseDescriptions: ["Zone 1: clarify the offer and start real conversations.", "Zone 2: outreach, objections, content, and follow-up.", "Zone 3: direct offers, tracking money, and asking for the sale."],
    blockerResponse: blockerMap[userProfile.blockers?.[0]] || blockerMap["I don't know where to start"],
    prioritySkills: ["sales", "communication", "discipline"],
    outcomeStatement: outcome[userProfile.ninety_day_target] || outcome["Make my first dollar outside my job"],
  };
}

export function generateAlternativeMission(currentMission, userProfile, note = "") {
  const pool = ALTERNATIVE_MISSIONS[currentMission.zone]?.[currentMission.skill] || [];
  const task = pick(pool.length ? pool : [currentMission.simplified_task || currentMission.task], `${note}${userProfile?.raw_dump || ""}${Date.now()}`);
  return {
    ...currentMission,
    task,
    why: currentMission.why,
    xp: currentMission.xp,
    skill: currentMission.skill,
    zone: currentMission.zone,
    adjusted: true,
  };
}

function formatMission(m) { return `${m.title}: ${m.task} Why this matters: ${m.why} Skill: ${m.skill.replace("_", " ")}. XP: +${m.xp}.`; }
function pick(items, seed = "") { return items[Math.abs([...String(seed)].reduce((a, c) => a + c.charCodeAt(0), 0)) % items.length]; }
