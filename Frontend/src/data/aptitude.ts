export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Question {
  q: string;
  options: string[];
  answer: number; // index
}

export interface Concept {
  id: string;
  name: string;
  difficulty: Difficulty;
  theory?: string; // Detailed formulas & concepts
  questions: Question[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  concepts: Concept[];
}

const mk = (q: string, options: string[], answer: number): Question => ({ q, options, answer });

export const categories: Category[] = [
  {
    id: "quantitative",
    name: "Quantitative Aptitude",
    description: "Numbers, percentages, profit & loss, ratios, and arithmetic mastery.",
    icon: "🔢",
    gradient: "from-purple-500/30 to-blue-500/30",
    concepts: [
      {
        id: "number-system",
        name: "Number System",
        difficulty: "Medium",
        theory: `### 🔢 Number System Formula Sheet & Tricks

**Core Formulas:**
- Product of two numbers = LCM × HCF.
- Divisibility by 3: Sum of digits div by 3.
- Divisibility by 9: Sum of digits div by 9.
- Sum of first N natural numbers = $\\frac{N(N+1)}{2}$.
- Sum of squares of first N natural numbers = $\\frac{N(N+1)(2N+1)}{6}$.
- Sum of cubes of first N natural numbers = $\\left[\\frac{N(N+1)}{2}\\right]^2$.

**Tricks & Shortcuts:**
- To find unit digit of $x^n$, find remainder of $n \\pmod 4$. If 0, use cycle power 4.
- Divisibility by 11: Difference of sum of digits at odd places and even places is 0 or multiple of 11.

**Solved Example:**
*Question:* Find HCF of 36 and 48.
*Solution:* Factors of 36 = 12 × 3, 48 = 12 × 4. Highest common factor = 12.

**Practice Example:**
*Question:* Find the smallest 4-digit number divisible by 12.
*Answer:* 1008.

**📚 Recommended Learning Resources:**
- [IndiaBIX Numbers Practice & Explanation](https://www.indiabix.com/aptitude/numbers/)
- [GeeksforGeeks Number System Guide](https://www.geeksforgeeks.org/number-system-in-aptitude/)`,
        questions: [
          mk("LCM of 12, 15, 20 = ?", ["30", "60", "120", "180"], 1),
          mk("HCF of 36 and 48 = ?", ["6", "8", "12", "16"], 2),
          mk("Smallest 4-digit no. divisible by 12?", ["1000", "1008", "1012", "1020"], 1),
          mk("Sum of first 50 natural numbers", ["1225", "1275", "1325", "1525"], 1),
          mk("Find unit digit of 7^35", ["1", "3", "7", "9"], 1),
          mk("How many primes less than 30?", ["8", "9", "10", "11"], 2),
          mk("(2^10) mod 7 = ?", ["1", "2", "3", "4"], 1),
          mk("Square root of 1521", ["37", "39", "41", "43"], 1),
          mk("Number is divisible by 9 if?", ["Sum of digits div 9", "Last digit 0", "Even", "Ends with 5"], 0),
          mk("Smallest no. when divided by 6,7,8 leaves remainder 3?", ["171", "168", "339", "243"], 0),
        ],
      },
      {
        id: "percentages",
        name: "Percentages",
        difficulty: "Easy",
        theory: `### 📈 Percentages Concept Sheet

**Core Formulas:**
- Percentage = $\\left( \\frac{\\text{Value}}{\\text{Total}} \\right) \\times 100$.
- Percentage Increase = $\\frac{\\text{Change}}{\\text{Original}} \\times 100$.
- Successive changes formula: If a value increases by $a\\%$ then $b\\%$, the net percentage change is $\\left( a + b + \\frac{a \\times b}{100} \\right)\\%$.

**Tricks & Shortcuts:**
- 10% = 0.1, 20% = 0.2, 25% = 1/4, 50% = 1/2.
- If A is x% more than B, B is $\\frac{x}{100+x} \\times 100\\%$ less than A.
- If A is x% less than B, B is $\\frac{x}{100-x} \\times 100\\%$ more than A.

**Solved Example:**
*Question:* 30% of 400 = ?
*Solution:* $0.30 \\times 400 = 120$.

**Practice Example:**
*Question:* If salary is increased by 10% and then decreased by 10%, net change?
*Answer:* 1% decrease.

**📚 Recommended Learning Resources:**
- [IndiaBIX Percentage Concepts](https://www.indiabix.com/aptitude/percentage/)
- [GeeksforGeeks Percentages Guide & Formulas](https://www.geeksforgeeks.org/percentages-aptitude-questions-and-answers/)`,
        questions: [
          mk("What is 20% of 250?", ["40", "50", "60", "75"], 1),
          mk("If a number is increased by 25% and becomes 150, find the original.", ["100", "110", "120", "125"], 2),
          mk("30% of 400 = ?", ["100", "110", "120", "130"], 2),
          mk("What % of 50 is 10?", ["15%", "20%", "25%", "30%"], 1),
          mk("If price drops from ₹200 to ₹160, the % decrease is:", ["10%", "15%", "20%", "25%"], 2),
          mk("60% of x is 90. x = ?", ["120", "140", "150", "160"], 2),
          mk("12.5% of 800 = ?", ["80", "90", "100", "120"], 2),
          mk("If 40% of A = 30% of B, then A:B = ?", ["3:4", "4:3", "2:3", "3:2"], 0),
          mk("A salary of ₹20,000 is increased by 15%. New salary?", ["22,000", "22,500", "23,000", "24,000"], 2),
          mk("Convert 0.45 into percentage.", ["4.5%", "45%", "0.45%", "450%"], 1),
        ],
      },
      {
        id: "profit-loss",
        name: "Profit and Loss",
        difficulty: "Medium",
        theory: `### 🏷️ Profit and Loss Formulas & Shortcuts

**Core Formulas:**
- Profit = Selling Price (SP) - Cost Price (CP)
- Loss = Cost Price (CP) - Selling Price (SP)
- Profit % = $\\frac{\\text{Profit}}{CP} \\times 100$
- Loss % = $\\frac{\\text{Loss}}{CP} \\times 100$
- Discount = Marked Price (MP) - Selling Price (SP)
- Discount % = $\\frac{\\text{Discount}}{MP} \\times 100$

**Tricks & Shortcuts:**
- For successive discounts of d1% and d2%, net discount = $(d1 + d2 - \\frac{d1 \\cdot d2}{100})\\%$.
- If a shopkeeper sells two items at same price, one at x% gain and other at x% loss, there is always a loss of $\\left(\\frac{x}{100}\\right)^2\\%$.

**Solved Example:**
*Question:* CP = ₹200, Profit = 10%. Find SP.
*Solution:* SP = $200 \\times 1.10 = 220$.

**Practice Example:**
*Question:* A shopkeeper sells at 10% loss. If he sold for ₹30 more, he'd gain 5%. Find CP.
*Answer:* ₹200.

**📚 Recommended Learning Resources:**
- [IndiaBIX Profit and Loss Questions & Answers](https://www.indiabix.com/aptitude/profit-and-loss/)
- [GeeksforGeeks Profit and Loss Formulas Guide](https://www.geeksforgeeks.org/profit-and-loss-in-aptitude/)`,
        questions: [
          mk("SP = ₹600, CP = ₹500. Profit% = ?", ["15%", "20%", "25%", "30%"], 1),
          mk("Buy for ₹120, sell for ₹90. Loss%?", ["20%", "25%", "30%", "33.3%"], 1),
          mk("A shopkeeper offers 20% discount on ₹150 list price. SP?", ["₹110", "₹120", "₹130", "₹140"], 1),
          mk("To gain 20% on a ₹500 item, SP must be:", ["₹550", "₹600", "₹620", "₹650"], 1),
          mk("If SP is doubled, profit triples. Find profit %.", ["50%", "100%", "150%", "200%"], 1),
          mk("Cost price of 15 articles = selling price of 12. Profit %?", ["20%", "25%", "30%", "40%"], 1),
          mk("Successive discounts of 10% and 20% equals a single discount of:", ["28%", "30%", "25%", "32%"], 0),
          mk("Sell at ₹240 with 20% profit. CP?", ["₹180", "₹190", "₹200", "₹210"], 2),
          mk("A dishonest dealer claims to sell at CP but uses 900g for 1kg. Gain%?", ["9%", "10%", "11.1%", "12.5%"], 2),
          mk("CP = ₹80, overheads = ₹20, SP = ₹120. Net profit%?", ["20%", "25%", "30%", "40%"], 0),
        ],
      },
      {
        id: "ratio-proportion",
        name: "Ratio and Proportion",
        difficulty: "Easy",
        theory: `### ⚖️ Ratio and Proportion Concept Sheet

**Core Formulas:**
- Ratio: comparison of two quantities. $a:b = \\frac{a}{b}$.
- Proportion: equality of two ratios. $a:b = c:d \\Rightarrow a \\cdot d = b \\cdot c$.

**Tricks & Shortcuts:**
- If $A:B = x:y$ and $B:C = z:w$, then $A:B:C = (x \\cdot z):(y \\cdot z):(y \\cdot w)$.

**Solved Example:**
*Question:* A:B = 2:3, B:C = 4:5. Find A:B:C.
*Solution:* A:B:C = (2*4) : (3*4) : (3*5) = 8 : 12 : 15.

**Practice Example:**
*Question:* Divide ₹1200 between A and B in ratio 5:7. Find A's share.
*Answer:* ₹500.`,
        questions: [
          mk("If A:B = 3:4 and B:C = 8:9, find A:C.", ["2:3", "3:2", "4:3", "3:4"], 0),
          mk("Two numbers are in ratio 3:5. If sum is 160, find smaller number.", ["50", "60", "70", "80"], 1),
          mk("If a:b = c:d, and a=2, b=4, c=6, find d.", ["8", "10", "12", "14"], 2),
          mk("Divide 300 in ratio 2:3:5. The largest share is:", ["120", "150", "180", "200"], 1),
          mk("Mean proportional of 4 and 16 is:", ["6", "8", "10", "12"], 1),
          mk("If 15% of A = 20% of B, then A:B =", ["3:4", "4:3", "15:20", "20:15"], 1),
          mk("Income of A and B are in ratio 4:3, expenses in 3:2. If both save ₹1000, find A's income.", ["₹3000", "₹4000", "₹5000", "₹6000"], 1),
          mk("A bag has coins of 1 rupee, 50p, 25p in ratio 5:6:8. Total value is ₹210. Number of 1 rupee coins?", ["100", "105", "110", "120"], 1),
          mk("What must be added to 7:11 to make it 3:4?", ["4", "5", "6", "8"], 1),
          mk("If x:y = 3:4, find (2x+3y):(3x+4y)", ["18:25", "18:27", "1:2", "3:4"], 0),
        ],
      },
      {
        id: "average",
        name: "Average",
        difficulty: "Easy",
        theory: `### 📊 Average Concept Sheet

**Core Formulas:**
- $\\text{Average} = \\frac{\\text{Sum of Observations}}{\\text{Number of Observations}}$.

**Tricks & Shortcuts:**
- Average of first N natural numbers = $\\frac{N+1}{2}$.
- Average of consecutive numbers is the middle term.

**Solved Example:**
*Question:* Average of 10, 20, 30, 40, 50 = ?
*Solution:* Sum = 150, Count = 5. Average = 150 / 5 = 30.

**Practice Example:**
*Question:* Average age of 5 students is 15. If a teacher's age is added, average becomes 18. Find teacher's age.
*Answer:* 33 years.`,
        questions: [
          mk("Average of first 10 natural numbers?", ["5", "5.5", "6", "6.5"], 1),
          mk("Average weight of 8 men increases by 2kg when a 50kg man is replaced. Weight of new man?", ["66 kg", "68 kg", "70 kg", "72 kg"], 0),
          mk("Average of odd numbers up to 100?", ["49", "49.5", "50", "50.5"], 2),
          mk("A batsman scores 80 runs in 17th inning, increasing average by 3. Average after 17th inning?", ["32", "35", "38", "40"], 0),
          mk("Average of 5 consecutive integers is 20. Largest is?", ["21", "22", "23", "24"], 1),
          mk("Average of 3 numbers is 15. If ratio is 3:5:7, numbers are:", ["9, 15, 21", "10, 15, 20", "6, 10, 14", "none"], 0),
          mk("Average marks of 40 students is 60. By adding 10 students with avg 50, new avg?", ["56", "58", "59", "60"], 1),
          mk("Average of 4 numbers is 20. If each is multiplied by 3, new average?", ["20", "40", "60", "80"], 2),
          mk("Average age of A and B is 20. If B is replaced by C, avg is 19. If A is replaced by C, avg is 21. C's age?", ["18", "20", "22", "24"], 1),
          mk("Average of squares of first 5 natural numbers?", ["9", "11", "12", "15"], 1),
        ],
      },
      {
        id: "time-work",
        name: "Time and Work",
        difficulty: "Medium",
        theory: `### ⏳ Time and Work Formula Sheet

**Core Formulas:**
- If A can do a work in X days, A's 1-day work = $1/X$.
- If A and B work together, 1-day work = $1/X + 1/Y$. Together time = $\\frac{XY}{X+Y}$.

**Tricks & Shortcuts:**
- Work = Efficiency × Time.
- If A is twice as efficient as B, A takes half the time B takes.

**Solved Example:**
*Question:* A does work in 10 days, B in 15. Together they take?
*Solution:* Time = $\\frac{10 \\times 15}{10 + 15} = \\frac{150}{25} = 6$ days.

**Practice Example:**
*Question:* A can do work in 8 days, B in 12. A works for 2 days alone, then B joins. Total days to finish?
*Answer:* 5.6 days.`,
        questions: [
          mk("A takes 6 days, B takes 12. Together they take:", ["3 days", "4 days", "5 days", "6 days"], 1),
          mk("A is twice as fast as B. If they finish together in 8 days, B alone takes:", ["12 days", "16 days", "24 days", "32 days"], 2),
          mk("A, B, C take 10, 12, 15 days. Together they take:", ["4 days", "5 days", "6 days", "8 days"], 0),
          mk("A does 1/3 work in 5 days, B does 2/5 in 10. Together they take:", ["8 days", "9.37 days", "10 days", "12 days"], 1),
          mk("A can do in 10 days. B joins him after 4 days. They finish rest in 3 days. B alone takes:", ["10 days", "15 days", "20 days", "30 days"], 0),
          mk("12 men or 18 women can do a work in 14 days. 8 men and 16 women together do in:", ["8 days", "9 days", "10 days", "12 days"], 1),
          mk("4 men and 6 women finish in 8 days. 3 men and 7 women in 10. 10 women take:", ["35 days", "40 days", "45 days", "50 days"], 1),
          mk("A takes 8 days, B takes 10 days. A works for 4 days, then B finishes. B takes:", ["4 days", "5 days", "6 days", "8 days"], 1),
          mk("A can complete in 24 days. B is 60% more efficient than A. B takes:", ["12 days", "15 days", "18 days", "20 days"], 1),
          mk("Contractor employs 30 men to build road in 40 days. After 25 days, employs 5 more. Finished 1 day early. Without extra men, delay would be:", ["1 day", "2 days", "3 days", "none"], 0),
        ],
      },
      {
        id: "time-speed-distance",
        name: "Time Speed and Distance",
        difficulty: "Medium",
        theory: `### 🚗 Time Speed and Distance Formula Sheet

**Core Formulas:**
- $\\text{Distance} = \\text{Speed} \\times \\text{Time}$.
- Convert km/hr to m/s: Multiply by $\\frac{5}{18}$.
- Convert m/s to km/hr: Multiply by $\\frac{18}{5}$.
- $\\text{Average Speed} = \\frac{2xy}{x+y}$ (for equal distance halves).

**Tricks & Shortcuts:**
- Speed ratio = Inverse of Time ratio (when distance is constant).

**Solved Example:**
*Question:* Convert 72 km/h to m/s.
*Solution:* $72 \\times \\frac{5}{18} = 40 \\times 0.5 = 20$ m/s.

**Practice Example:**
*Question:* A car travels at 60 km/h for 2 hours and 80 km/h for 3 hours. Average speed?
*Answer:* 72 km/h.`,
        questions: [
          mk("Convert 54 km/h to m/s.", ["10", "15", "20", "25"], 1),
          mk("A train travels 300 km in 5 hours. Speed is:", ["50 km/h", "60 km/h", "70 km/h", "80 km/h"], 1),
          mk("Travel at 40 km/h for half way, 60 km/h for second half. Average speed?", ["48 km/h", "50 km/h", "52 km/h", "55 km/h"], 0),
          mk("A man walks at 5 km/h and misses train by 7 min. If 6 km/h, arrives 5 min early. Distance?", ["5 km", "6 km", "8 km", "10 km"], 1),
          mk("Ratio of speeds of two cars is 3:4. Time ratio to cover same distance?", ["3:4", "4:3", "9:16", "none"], 1),
          mk("A train 150m long passes pole in 15 seconds. Speed in km/h?", ["36", "45", "54", "72"], 0),
          mk("Two trains start at same time from A and B at 60 and 75 km/h. When they meet, one has traveled 60 km more. Distance between A and B?", ["500 km", "540 km", "580 km", "600 km"], 1),
          mk("Walk at 3/4 of normal speed and reach 20 mins late. Normal time?", ["30 min", "45 min", "60 min", "75 min"], 2),
          mk("A thief is spotted by cop at 200m. Thief runs at 10km/h, cop at 11km/h. Distance between them after 6 mins?", ["100m", "120m", "150m", "180m"], 0),
          mk("A car covers 4 stations. Speed in successive quarters is 10, 20, 30, 60 km/h. Average speed?", ["20 km/h", "24 km/h", "30 km/h", "40 km/h"], 0),
        ],
      },
      {
        id: "pipes-cisterns",
        name: "Pipes and Cisterns",
        difficulty: "Medium",
        theory: `### 🚰 Pipes and Cisterns Formula Sheet

**Core Formulas:**
- If Pipe A fills a tank in X hours, 1-hour work = $+1/X$.
- If Pipe B empties a tank in Y hours, 1-hour work = $-1/Y$.
- Together: 1-hour work = $\\frac{1}{X} - \\frac{1}{Y}$ (if A fills, B drains).

**Tricks & Shortcuts:**
- Time taken to fill when leak is present is calculated as equivalent work.

**Solved Example:**
*Question:* Pipe A fills in 10 hrs, B fills in 15. Together they fill in?
*Solution:* Equivalent to Time & Work: $\\frac{10 \\times 15}{10 + 15} = 6$ hours.

**Practice Example:**
*Question:* A pipe fills in 4 hours. A leak drains it in 6. Time to fill when both open?
*Answer:* 12 hours.`,
        questions: [
          mk("Pipe A fills in 8 hrs, B in 12. Together they take:", ["4.8 hours", "5 hours", "5.5 hours", "6 hours"], 0),
          mk("Pipe A fills in 6 hrs, waste pipe empties in 9. Both open, time to fill?", ["12 hours", "15 hours", "18 hours", "20 hours"], 2),
          mk("A tank has leak that empties in 8 hrs. A tap fills at 6L/min. If both open, tank empties in 12 hrs. Capacity of tank?", ["7200L", "8640L", "9200L", "9600L"], 1),
          mk("Three taps A, B, C fill in 10, 20, 30 mins. Together they take:", ["5.45 mins", "6 mins", "8 mins", "9 mins"], 0),
          mk("Pipe A fills in 4 hrs, B fills in 6. A open first hour, then B, alternating. Filled in:", ["4.5 hours", "4.67 hours", "5 hours", "5.2 hours"], 1),
          mk("Two pipes fill in 15 and 20 mins. Waste pipe drains 3 gallons/min. All open, filled in 15 mins. Capacity?", ["100 gallons", "120 gallons", "150 gallons", "180 gallons"], 1),
          mk("Pipe A fills in 10 hrs, B fills in 12, C empties in 20. Together they take:", ["7.5 hours", "8 hours", "9 hours", "10 hours"], 0),
          mk("Pipe A twice as fast as B. Both fill in 12 mins. B alone takes:", ["18 mins", "24 mins", "36 mins", "48 mins"], 2),
          mk("Tank filled by A in 5 hrs, B in 10. C empties in 8. Together they take:", ["5.33 hours", "6.67 hours", "8 hours", "10 hours"], 1),
          mk("A pipe fills in 12 mins, another in 15. If leak can empty in 20 mins, time to fill is:", ["8 mins", "10 mins", "12 mins", "15 mins"], 1),
        ],
      },
      {
        id: "partnership",
        name: "Partnership",
        difficulty: "Easy",
        theory: `### 🤝 Partnership Formula Sheet

**Core Formulas:**
- Profit ratio = (Investment A × Time A) : (Investment B × Time B).
- If time is same, Profit ratio = Investment A : Investment B.

**Solved Example:**
*Question:* A invests ₹5000 for 12 months, B invests ₹6000 for 6 months. Profit ratio?
*Solution:* Ratio = (5000 × 12) : (6000 × 6) = 60000 : 36000 = 5 : 3.

**Practice Example:**
*Question:* A and B start a business with ₹10,000 and ₹15,000. Profit at year-end is ₹5000. A's share?
*Answer:* ₹2000.`,
        questions: [
          mk("A and B invest ₹20000 and ₹30000. Yearly profit ₹10000. A's share?", ["₹4000", "₹5000", "₹6000", "₹8000"], 0),
          mk("A invests ₹5000 for 12 months, B ₹6000 for 6 months. B's profit share out of ₹4000?", ["₹1500", "₹2000", "₹2500", "₹3000"], 0),
          mk("A, B, C invest in ratio 5:7:8. Year-end profit is ₹4000. B's share?", ["₹1000", "₹1400", "₹1600", "₹1800"], 1),
          mk("A starts with ₹3500. B joins after 5 months with ₹4000. Year-end profit ₹2600. A's share?", ["₹1500", "₹1600", "₹1800", "₹2000"], 0),
          mk("A, B, C start. A invests 3 times B, B invests 2/3 C. Ratio of capitals?", ["6:2:3", "3:2:3", "6:3:2", "none"], 0),
          mk("A invests 1/6 capital for 1/6 time, B 1/3 capital for 1/3 time, C rest of capital for full time. Profit ratio?", ["1:4:18", "1:1:1", "1:2:3", "none"], 0),
          mk("A, B, C rent pasture for ₹870. A grazes 10 cows for 20 days, B 30 for 8 days, C 16 for 9 days. C pays?", ["₹200", "₹216", "₹240", "₹260"], 1),
          mk("A invests ₹4000. 4 months later B joins with ₹6000. Yearly profit ₹16000. B's share?", ["₹8000", "₹9000", "₹10000", "₹12000"], 0),
          mk("A and B invest in ratio 3:2. 5% of profit goes to charity. A's share is ₹855. Total profit?", ["₹1425", "₹1500", "₹1575", "₹1625"], 1),
          mk("A, B, C invest ₹2000, ₹3000, ₹4000. A withdraws after 6 months. Yearly profit ₹18000. A's share?", ["₹3000", "₹4000", "₹6000", "₹8000"], 0),
        ],
      },
      {
        id: "ages",
        name: "Ages",
        difficulty: "Easy",
        theory: `### 🎂 Problems on Ages Concept Sheet

**Core Formulas:**
- If current age is X, age N years ago = X - N.
- Age N years hence = X + N.

**Tricks & Shortcuts:**
- Difference in ages between two persons remains constant throughout their lives.

**Solved Example:**
*Question:* Father is 3 times older than son. Sum of ages is 48. Find son's age.
*Solution:* $3S + S = 48 \\Rightarrow 4S = 48 \\Rightarrow S = 12$.

**Practice Example:**
*Question:* A is 5 years older than B. 5 years ago, A was twice as old as B. Current age of B?
*Answer:* 10 years.`,
        questions: [
          mk("A is twice as old as B. Sum of ages is 30. A's age?", ["10", "15", "20", "25"], 2),
          mk("Ratio of ages of A and B is 4:3. Sum is 28. B's age?", ["9", "12", "15", "18"], 1),
          mk("10 years ago, A was half of B. Ratio now is 3:4. A's age now?", ["15", "20", "25", "30"], 0),
          mk("Father is 30 years older than son. In 5 years, he'll be thrice son's age. Father's age now?", ["35", "40", "45", "50"], 1),
          mk("Ratio of A to B is 5:7. If difference is 8 years, sum is:", ["40", "44", "48", "52"], 2),
          mk("Present ages of X and Y are in ratio 5:6. After 7 years, ratio is 6:7. X's age is:", ["30", "35", "40", "45"], 1),
          mk("Present age of Father is 4 times son's. 5 years ago, father was 7 times son's age. Father's age?", ["32", "36", "40", "45"], 2),
          mk("A is 2 years older than B, who is twice as old as C. Sum of ages is 27. B's age?", ["8", "10", "12", "14"], 1),
          mk("Average age of 4 siblings is 12. If father is added, avg is 22. Father's age?", ["52", "58", "62", "66"], 2),
          mk("Present age ratio of A and B is 3:5. 9 years ago, ratio was 12:23. Present age of A?", ["27", "33", "36", "45"], 1),
        ],
      },
      {
        id: "probability",
        name: "Probability",
        difficulty: "Medium",
        theory: `### 🎲 Probability Formula Sheet

**Core Formulas:**
- $\\text{Probability } P(E) = \\frac{\\text{Number of Favorable Outcomes}}{\\text{Total Number of Outcomes}}$.
- $0 \\leq P(E) \\leq 1$.
- $P(\\text{Not } E) = 1 - P(E)$.

**Solved Example:**
*Question:* Probability of getting an even number in a single die roll?
*Solution:* Fav = {2, 4, 6} (3 outcomes). Total = {1, 2, 3, 4, 5, 6} (6 outcomes). $P = 3/6 = 0.5$.

**Practice Example:**
*Question:* Two coins are tossed. Probability of getting at least one head?
*Answer:* 3/4.`,
        questions: [
          mk("Probability of drawing a spade from a deck of cards?", ["1/2", "1/4", "1/13", "1/52"], 1),
          mk("Two dice are rolled. Prob of sum being 7?", ["1/6", "1/12", "5/36", "7/36"], 0),
          mk("Prob of getting a prime number on rolling a die?", ["1/2", "1/3", "2/3", "5/6"], 0),
          mk("A bag has 3 red, 5 green balls. Prob of drawing a red ball?", ["3/5", "3/8", "5/8", "1/2"], 1),
          mk("Prob of leap year having 53 Sundays?", ["1/7", "2/7", "3/7", "5/7"], 1),
          mk("Three coins are tossed. Prob of getting 2 heads?", ["3/8", "1/2", "5/8", "1/4"], 0),
          mk("From 1 to 20, a number is drawn. Prob that it is prime?", ["2/5", "3/10", "9/20", "1/2"], 0),
          mk("Draw 2 cards from deck. Prob that both are aces?", ["1/221", "1/169", "4/663", "none"], 0),
          mk("A and B speak truth in 75% and 80% cases. Prob that they contradict on a fact?", ["30%", "35%", "40%", "45%"], 1),
          mk("Prob of drawing a red king from deck?", ["1/13", "1/26", "2/13", "1/52"], 1),
        ],
      },
      {
        id: "permutation-combination",
        name: "Permutation and Combination",
        difficulty: "Hard",
        theory: `### 🔢 Permutation & Combination Formulas

**Core Formulas:**
- Factorial: $n! = n \\cdot (n-1) \\dots 1$.
- Permutation (Arrangement): $^nP_r = \\frac{n!}{(n-r)!}$.
- Combination (Selection): $^nC_r = \\frac{n!}{r!(n-r)!}$.

**Solved Example:**
*Question:* In how many ways can 3 books be arranged out of 5?
*Solution:* $^5P_3 = \\frac{5!}{(5-3)!} = \\frac{120}{2} = 60$ ways.

**Practice Example:**
*Question:* In how many ways can a team of 3 be chosen from 6 players?
*Answer:* $^6C_3 = 20$ ways.`,
        questions: [
          mk("Find 5P2.", ["10", "20", "30", "40"], 1),
          mk("Find 6C3.", ["15", "20", "25", "30"], 1),
          mk("Ways to arrange letters of WORD 'CAT'?", ["3", "6", "9", "12"], 1),
          mk("Ways to arrange 'APPLE'?", ["60", "120", "180", "240"], 0),
          mk("Out of 5 men and 3 women, form committee of 3 with at least 1 woman. Ways?", ["40", "46", "56", "60"], 1),
          mk("Handshakes in a group of 10 people?", ["45", "90", "100", "120"], 0),
          mk("Ways to select 2 cards from a deck?", ["1326", "1350", "2652", "none"], 0),
          mk("Arrangement of 5 keys on a circular key ring?", ["12", "24", "60", "120"], 0),
          mk("How many diagonals are in a decagon (10 sides)?", ["25", "35", "45", "55"], 1),
          mk("Ways to arrange letters of LEADING so vowels are together?", ["360", "720", "1440", "2880"], 1),
        ],
      },
      {
        id: "simple-interest",
        name: "Simple Interest",
        difficulty: "Easy",
        theory: `### 💰 Simple Interest Formula Sheet

**Core Formulas:**
- $\\text{Simple Interest (SI)} = \\frac{P \\cdot R \\cdot T}{100}$.
- $\\text{Total Amount (A)} = P + SI = P \\left(1 + \\frac{R \\cdot T}{100}\\right)$.

**Solved Example:**
*Question:* Find SI on ₹1000 at 10% for 2 years.
*Solution:* $SI = \\frac{1000 \\times 10 \\times 2}{100} = ₹200$.

**Practice Example:**
*Question:* A sum doubles itself in 5 years. Find rate of simple interest.
*Answer:* 20%.`,
        questions: [
          mk("SI on ₹5000 at 8% for 3 years?", ["₹1000", "₹1200", "₹1500", "₹1800"], 1),
          mk("A sum doubles itself in 8 years. Rate of SI?", ["10%", "12.5%", "15%", "20%"], 1),
          mk("Sum that yields ₹100 SI per year at 5% rate?", ["₹1500", "₹2000", "₹2500", "₹3000"], 1),
          mk("SI on ₹2000 at 6% for 18 months?", ["₹150", "₹180", "₹200", "₹240"], 1),
          mk("If SI is 1/9 of principal and rate = time, rate is:", ["3.33%", "4%", "5%", "6%"], 0),
          mk("Sum of money at SI amounts to ₹815 in 3 years, ₹854 in 4 years. Sum is:", ["₹650", "₹690", "₹698", "₹700"], 2),
          mk("A sum doubles at 5% SI. How long will it take?", ["10 years", "15 years", "20 years", "25 years"], 2),
          mk("₹800 amounts to ₹920 in 3 years at SI. If rate is increased by 3%, new amount?", ["₹950", "₹980", "₹992", "₹1000"], 2),
          mk("A borrows ₹5000 at 6% SI, lends to B at 8.5% SI. Yearly gain?", ["₹100", "₹125", "₹150", "₹175"], 1),
          mk("Sum amounts to ₹1200 in 2 years, ₹1500 in 5 years. Principal?", ["₹800", "₹1000", "₹1050", "₹1100"], 1),
        ],
      },
      {
        id: "compound-interest",
        name: "Compound Interest",
        difficulty: "Hard",
        theory: `### 📈 Compound Interest Formula Sheet

**Core Formulas:**
- $\\text{Amount (A)} = P \\left(1 + \\frac{R}{100}\\right)^T$.
- $\\text{Compound Interest (CI)} = A - P = P \\left[ \\left(1 + \\frac{R}{100}\\right)^T - 1 \\right]$.
- Difference between CI and SI for 2 years = $P \\left(\\frac{R}{100}\\right)^2$.

**Solved Example:**
*Question:* Find CI on ₹1000 at 10% for 2 years.
*Solution:* $A = 1000(1.10)^2 = 1000 \\times 1.21 = ₹1210$. $CI = 1210 - 1000 = ₹210$.

**Practice Example:**
*Question:* A sum at CI doubles in 4 years. In how many years will it become 8 times?
*Answer:* 12 years.`,
        questions: [
          mk("CI on ₹10000 at 10% for 2 years?", ["₹2000", "₹2100", "₹2200", "₹2500"], 1),
          mk("Sum doubles in 5 years at CI. It becomes 8 times in:", ["10 years", "15 years", "20 years", "25 years"], 1),
          mk("CI on ₹5000 at 20% for 1.5 years compounded half-yearly?", ["₹1550", "₹1655", "₹1800", "₹2000"], 1),
          mk("Difference between CI and SI on ₹1000 at 10% for 2 years?", ["₹10", "₹15", "₹20", "₹25"], 0),
          mk("A sum of money amounts to ₹6690 in 3 years, ₹10035 in 6 years at CI. Sum is:", ["₹4400", "₹4460", "₹4500", "₹4600"], 1),
          mk("If CI on a sum for 2 years is ₹210, SI is ₹200. Rate?", ["5%", "10%", "15%", "20%"], 1),
          mk("Sum amounts to ₹1331 in 3 years at 10% CI. Principal?", ["₹800", "₹900", "₹1000", "₹1100"], 2),
          mk("At what rate % CI will ₹32000 yield ₹5044 interest in 9 months compounded quarterly?", ["15%", "16%", "20%", "24%"], 2),
          mk("CI on ₹2000 at 10% for 3 years?", ["₹600", "₹630", "₹662", "₹680"], 2),
          mk("Value of machine depreciates 10% annually. Bought for ₹10000. Value after 2 years?", ["₹8000", "₹8100", "₹8500", "₹9000"], 1),
        ],
      },
      {
        id: "boats-streams",
        name: "Boats and Streams",
        difficulty: "Medium",
        theory: `### ⛵ Boats and Streams Formula Sheet

**Core Terms:**
- Speed of boat in still water = u.
- Speed of stream = v.
- Downstream Speed (with current) = $u + v$.
- Upstream Speed (against current) = $u - v$.
- $u = \\frac{\\text{Downstream} + \\text{Upstream}}{2}$.
- $v = \\frac{\\text{Downstream} - \\text{Upstream}}{2}$.

**Solved Example:**
*Question:* Speed downstream is 15 km/h, upstream is 9 km/h. Speed of boat in still water?
*Solution:* $u = \\frac{15 + 9}{2} = 12$ km/h.

**Practice Example:**
*Question:* A boat goes 24 km downstream in 2 hours. Speed of stream is 4 km/h. Find upstream speed.
*Answer:* 4 km/h.`,
        questions: [
          mk("Downstream speed is 18 km/h, upstream is 10 km/h. Speed of stream?", ["3 km/h", "4 km/h", "5 km/h", "6 km/h"], 1),
          mk("Boat speed in still water is 15 km/h, stream speed is 3 km/h. Downstream speed?", ["12", "15", "18", "21"], 2),
          mk("A man rows 18 km downstream in 3 hrs, 12 km upstream in 3 hrs. Still water speed?", ["4 km/h", "5 km/h", "6 km/h", "7 km/h"], 1),
          mk("Boat covers 30km upstream in 5 hours, same downstream in 3 hours. Still water speed?", ["7 km/h", "8 km/h", "9 km/h", "10 km/h"], 1),
          mk("Stream speed is 2 km/h. Upstream speed is 10 km/h. Downstream speed?", ["12", "14", "16", "18"], 1),
          mk("Row at 6 km/h in still water. If stream speed is 2 km/h, time to row 8 km and back?", ["2.5 hours", "3 hours", "3.5 hours", "4 hours"], 1),
          mk("Row at 5 km/h still water. If stream is 1 km/h, it takes 75 mins to row and return. Distance?", ["2 km", "3 km", "4 km", "5 km"], 1),
          mk("Upstream speed of boat is 40% of downstream speed. If still water speed is 7 km/h, stream speed?", ["2 km/h", "3 km/h", "4 km/h", "5 km/h"], 1),
          mk("Boat goes 8 km downstream in 40 mins. Upstream speed is 8 km/h. Still water speed?", ["10 km/h", "12 km/h", "14 km/h", "15 km/h"], 0),
          mk("Row downstream 12 km and return. Total time is 3 hrs. If still water speed is 9 km/h, stream speed?", ["3 km/h", "4 km/h", "5 km/h", "6 km/h"], 0),
        ],
      },
    ],
  },
  {
    id: "logical",
    name: "Logical Reasoning",
    description: "Patterns, sequences, syllogisms, and analytical thinking.",
    icon: "🧩",
    gradient: "from-pink-500/30 to-purple-500/30",
    concepts: [
      {
        id: "series",
        name: "Number Series",
        difficulty: "Easy",
        theory: `### 🔢 Number Series Concept Sheet

**Common Patterns:**
- Arithmetic (addition/subtraction).
- Geometric (multiplication/division).
- Squares and cubes ($n^2, n^3$).
- Alternating series.

**Solved Example:**
*Question:* Next in series: 2, 4, 8, 16, ?
*Solution:* Each term is multiplied by 2. Next = $16 \\times 2 = 32$.

**Practice Example:**
*Question:* Find the next number in series: 5, 11, 23, 47, ?
*Answer:* 95 ($2n + 1$).`,
        questions: [
          mk("2, 4, 8, 16, ?", ["20", "24", "32", "64"], 2),
          mk("3, 6, 11, 18, ?", ["25", "27", "29", "31"], 1),
          mk("1, 4, 9, 16, ?", ["20", "24", "25", "30"], 2),
          mk("5, 10, 20, 40, ?", ["60", "70", "80", "100"], 2),
          mk("100, 81, 64, 49, ?", ["25", "30", "36", "40"], 2),
          mk("2, 3, 5, 7, 11, ?", ["12", "13", "14", "15"], 1),
          mk("1, 1, 2, 3, 5, ?", ["6", "7", "8", "9"], 2),
          mk("7, 14, 28, 56, ?", ["84", "98", "112", "120"], 2),
          mk("9, 27, 81, ?", ["108", "162", "243", "324"], 2),
          mk("0, 1, 4, 9, 16, ?", ["20", "24", "25", "27"], 2),
        ],
      },
      {
        id: "syllogism",
        name: "Syllogisms",
        difficulty: "Medium",
        theory: `### 🪵 Syllogisms Concept Sheet

**Rules of Syllogisms:**
- Use Venn Diagrams to map relations.
- "All A are B" -> A is inside B.
- "Some A are B" -> Overlapping circles.
- "No A are B" -> Separated circles.

**Solved Example:**
*Question:* Statements: All cats are animals. Some animals are wild.
*Solution:* Draw Cat inside Animal. Wild overlaps with Animal, but does not necessarily overlap with Cat. Thus "Some cats are wild" is invalid/uncertain.

**Practice Example:**
*Question:* Statements: All pens are pencils. All pencils are markers.
*Answer:* All pens are markers.`,
        questions: [
          mk("All cats are mammals. Some mammals are wild. ⇒", ["All cats wild", "Some cats wild", "No cats wild", "Cannot be determined"], 3),
          mk("All flowers are red. All red things are nice. ⇒", ["All flowers nice", "Some flowers nice", "No flowers nice", "None"], 0),
          mk("Some pens are pencils. All pencils are erasers. ⇒", ["Some pens are erasers", "All pens are erasers", "No pens are erasers", "Cannot say"], 0),
          mk("All dogs bark. Tommy is a dog. ⇒", ["Tommy doesn't bark", "Tommy barks", "Tommy may bark", "None"], 1),
          mk("No A is B. All B are C. ⇒", ["No A is C", "Some A are C", "Some C are not A", "Cannot determine"], 2),
          mk("All apples are fruits. Some fruits are sour. ⇒", ["All apples sour", "Some apples sour", "No apples sour", "Cannot determine"], 3),
          mk("All boys play. Ram is a boy. ⇒", ["Ram plays", "Ram doesn't play", "Ram may play", "None"], 0),
          mk("Some men are tall. All tall are strong. ⇒", ["Some men strong", "All men strong", "No men strong", "None"], 0),
          mk("All cars are vehicles. No vehicle is animal. ⇒", ["No car is animal", "Some cars animals", "All cars animals", "Cannot say"], 0),
          mk("Some birds fly. All flying things have wings. ⇒", ["Some birds have wings", "All birds have wings", "No birds have wings", "Cannot determine"], 0),
        ],
      },
      {
        id: "directions",
        name: "Direction Sense",
        difficulty: "Easy",
        theory: `### 🧭 Direction Sense Formulas & Grid

**Core Concepts:**
- N (North), S (South), E (East), W (West).
- Right turn from North is East.
- Displacement = $\\sqrt{x^2 + y^2}$ (Pythagoras Theorem).

**Solved Example:**
*Question:* A person walks 3 km East, then 4 km North. Straight line distance?
*Solution:* $d = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$ km.

**Practice Example:**
*Question:* Face North, turn 90 degrees clockwise, then 180 degrees counter-clockwise. Facing?
*Answer:* West.`,
        questions: [
          mk("Walk 5km North, then 3km East. Distance from start?", ["√34 km", "8 km", "5 km", "7 km"], 0),
          mk("Face North, turn right. Now facing?", ["South", "East", "West", "North"], 1),
          mk("Walk 4 km South then 3 km West. Distance?", ["5 km", "7 km", "6 km", "4 km"], 0),
          mk("From A, go N then turn 90° clockwise. Direction?", ["E", "W", "S", "N"], 0),
          mk("If S = down, N = up, E = right, W = ?", ["Down", "Up", "Right", "Left"], 3),
          mk("Walk 3km E, 4km N, 3km W. Distance from start?", ["3 km", "4 km", "5 km", "6 km"], 1),
          mk("Sun rises in?", ["North", "South", "East", "West"], 2),
          mk("Face E, turn 180°. Now facing?", ["N", "S", "E", "W"], 3),
          mk("From P go 10km N, 10km E, 10km S. Distance from P?", ["10 km", "20 km", "30 km", "0 km"], 0),
          mk("NE direction is between?", ["N and S", "N and E", "S and E", "S and W"], 1),
        ],
      },
      {
        id: "calendar",
        name: "Calendar",
        difficulty: "Medium",
        theory: `### 📅 Calendar Rules & odd days calculation

**Core Rules:**
- Leap year: year divisible by 4 (and not by 100, unless by 400).
- Ordinary year has 1 odd day (365 mod 7 = 1).
- Leap year has 2 odd days.

**Solved Example:**
*Question:* If today is Monday, what day is it after 100 days?
*Solution:* Odd days = 100 mod 7 = 2. Monday + 2 = Wednesday.

**Practice Example:**
*Question:* How many leap years are in a century?
*Answer:* 24 (or 25 if the centurial year is leap).`,
        questions: [
          mk("Odd days in 365 days?", ["0", "1", "2", "3"], 1),
          mk("Which of these is a leap year?", ["1900", "2000", "2100", "2200"], 1),
          mk("Today is Monday. After 61 days it will be:", ["Tuesday", "Wednesday", "Saturday", "Sunday"], 2),
          mk("1st Jan 2007 was Monday. 1st Jan 2008 was:", ["Monday", "Tuesday", "Wednesday", "Sunday"], 1),
          mk("How many odd days are in 100 years?", ["1", "3", "5", "6"], 2),
          mk("On what dates of April 2001 did Wednesday fall?", ["1, 8, 15", "4, 11, 18, 25", "3, 10, 17, 24", "none"], 1),
          mk("Calendar of 2007 repeats in:", ["2014", "2016", "2018", "2020"], 2),
          mk("Last day of century cannot be:", ["Monday", "Wednesday", "Friday", "Tuesday"], 3),
          mk("Number of days in month of February in 2400?", ["28", "29", "30", "none"], 1),
          mk("If 15th Aug 1947 was Friday, 15th Aug 1948 was:", ["Saturday", "Sunday", "Monday", "Tuesday"], 1),
        ],
      },
      {
        id: "clock",
        name: "Clock",
        difficulty: "Medium",
        theory: `### 🕒 Clock Angle Formula

**Core Formulas:**
- Angle between hour hand and minute hand at H hrs, M mins = $|30H - 5.5M|$ degrees.
- Hands coincide once every 65 $\\frac{5}{11}$ mins.

**Solved Example:**
*Question:* Angle at 3:30?
*Solution:* Angle = $|30(3) - 5.5(30)| = |90 - 165| = 75^\\circ$.

**Practice Example:**
*Question:* At what time between 4 and 5 o'clock will hands coincide?
*Answer:* 21 $\\frac{9}{11}$ mins past 4.`,
        questions: [
          mk("Angle at 4:20?", ["0°", "10°", "20°", "30°"], 1),
          mk("Angle at 9:00?", ["90°", "180°", "270°", "0°"], 0),
          mk("How many times do hands coincide in a day?", ["11", "22", "44", "48"], 1),
          mk("How many times do hands form right angle in a day?", ["22", "24", "44", "48"], 2),
          mk("Clock shows 8:30. Angle is:", ["75°", "80°", "85°", "90°"], 0),
          mk("Angle at 10:10?", ["115°", "245°", "240°", "110°"], 0),
          mk("Hands are in opposite directions (straight line) how many times a day?", ["11", "22", "44", "none"], 1),
          mk("Angle at 6:00?", ["90°", "180°", "270°", "0°"], 1),
          mk("A clock loses 2 mins in 24 hrs. If set right on Sunday 10 AM, true time on next Sunday when it shows 9:46 PM?", ["9:30 PM", "10 PM", "10:30 PM", "none"], 1),
          mk("Angle at 2:15?", ["22.5°", "25°", "30°", "45°"], 0),
        ],
      },
      {
        id: "coding-decoding",
        name: "Coding-Decoding",
        difficulty: "Easy",
        theory: `### 🔠 Coding-Decoding Tricks

**Core Rules:**
- Map letters to positions: A=1, B=2 ... Z=26.
- Reverse positions: A=26, B=25 ... Z=1.
- Look for shift patterns (+1, -1, +2, -2, etc.).

**Solved Example:**
*Question:* If TODAY = UPEBZ then YOUTH = ?
*Solution:* T->U (+1), O->P (+1), D->E (+1) ... YOUTH -> ZPVUI.

**Practice Example:**
*Question:* If INK = 37, find pen.
*Answer:* P(16) + E(5) + N(14) = 35.`,
        questions: [
          mk("If CAT = DBU, then DOG = ?", ["EPH", "EPI", "EOH", "EPH"], 0),
          mk("If COLD = DPME, then WARM = ?", ["XBSN", "XBSO", "XBTM", "none"], 0),
          mk("If BAD = 7, find CAB.", ["5", "6", "7", "8"], 1),
          mk("If RANGER = SBOIFS, find FOREST.", ["GPSTVU", "GPSTTV", "GPUTTU", "none"], 0),
          mk("If BLUE = 40, find RED.", ["27", "28", "29", "30"], 0),
          mk("If DELHI = CCIDD, find BOMBAY.", ["AMJXVS", "AMJZVS", "ANJZVS", "none"], 1),
          mk("If MASTER = OCUVGT, find PUPIL.", ["RWRKN", "RWRKM", "RXRKN", "none"], 0),
          mk("If 123 = CAT, 321 = ?", ["TAC", "ACT", "CAT", "ATC"], 0),
          mk("If TEACHER = VGCEJGT, STUDENT = ?", ["UVWFENT", "UVWFENT", "UVWGENT", "none"], 3), // STUDENT -> UVWFGPU
          mk("If WATER = XBUFS, find FIRE.", ["GJSF", "GJRG", "GJSG", "none"], 0),
        ],
      },
      {
        id: "blood-relations",
        name: "Blood Relations",
        difficulty: "Medium",
        theory: `### 🌳 Blood Relations Mapping

**Core Guidelines:**
- Male represents + or Square.
- Female represents - or Circle.
- Double lines for couple, single for siblings, vertical for generations.

**Solved Example:**
*Question:* Pointing to a man: 'His mother is my mother's daughter.' Who is he?
*Solution:* My mother's daughter is my sister (or myself). Since his mother is that person, he is my nephew or son.

**Practice Example:**
*Question:* A is B's brother. C is A's mother. How is C related to B?
*Answer:* Mother.`,
        questions: [
          mk("A is brother of B. B is sister of C. How is A related to C?", ["Brother", "Sister", "Cousin", "Father"], 0),
          mk("Pointing to a man, a lady says: 'His wife is only daughter of my father.' How is man related to lady?", ["Husband", "Brother", "Son", "Cousin"], 0),
          mk("A's father is B's son. How is A related to B?", ["Son", "Grandson", "Uncle", "Brother"], 1),
          mk("A is mother of B and C. If D is husband of C, how is A related to D?", ["Mother-in-law", "Aunt", "Mother", "none"], 0),
          mk("A and B are married couple. X and Y are brothers. X is brother of A. Y is to B?", ["Brother-in-law", "Brother", "Cousin", "none"], 0),
          mk("Introducing a girl, Vipin said, 'Her mother is the only daughter of my mother-in-law.' Vipin is to girl?", ["Father", "Uncle", "Brother", "none"], 0),
          mk("A is father of B. C is daughter of B. D is brother of B. How is D related to C?", ["Uncle", "Nephew", "Cousin", "Grandfather"], 0),
          mk("If A+B = A is sister of B, A*B = A is husband of B, find relation of P+Q*R.", ["P is sister-in-law of R", "P is sister of R", "P is mother of R", "none"], 0),
          mk("B is husband of P. Q is only grandson of D, who is wife of P. How is B related to Q?", ["Grandfather", "Father", "Uncle", "none"], 0),
          mk("A's mother is sister of B and daughter of C. D is daughter of B. Relation of A to D?", ["Cousin", "Nephew", "Uncle", "Brother"], 0),
        ],
      },
      {
        id: "seating-arrangement",
        name: "Seating Arrangement",
        difficulty: "Hard",
        theory: `### 🪑 Seating Arrangement Rules

**Core Rules:**
- Linear: left/right relative to facing direction.
- Circular facing inside: Clockwise is Left, Counter-Clockwise is Right.
- Circular facing outside: Clockwise is Right, Counter-Clockwise is Left.

**Solved Example:**
*Question:* 5 people A, B, C, D, E. A is middle, B left of A. B's index (1 to 5)?
*Solution:* Arrangement: _ , B , A , _ , _ . B is in 2nd position.

**Practice Example:**
*Question:* A, B, C, D sit circular facing center. A is right of B, C is left of B. Who is opposite to B?
*Answer:* D.`,
        questions: [
          mk("5 people in row. A is middle, B is immediate left of A. Position of B?", ["1st", "2nd", "4th", "5th"], 1),
          mk("A, B, C, D in circle facing center. A is opposite B. Who is opposite C?", ["A", "B", "D", "Cannot say"], 2),
          mk("6 people circular. A is right of B, opposite C. Left of C is D. Who is opposite D?", ["A", "B", "E", "Cannot say"], 1),
          mk("8 people in circle. B is 3rd right of A. A is opposite E. Position of B relative to E?", ["2nd left", "2nd right", "3rd left", "3rd right"], 0),
          mk("P, Q, R, S in square table. P is left of Q, opposite R. Who is right of S?", ["P", "Q", "R", "Cannot say"], 1),
          mk("Five boys A, B, C, D, E sit in row. A is right of B, E is left of B but right of C. A is left of D. Who is in middle?", ["A", "B", "C", "E"], 1),
          mk("A, B, C, D, E circular facing center. A is between E and D. B is right of D. Who is left of E?", ["A", "B", "C", "D"], 2),
          mk("6 friends sit in row. B is between F and D. E is between A and C. A does not sit next to F or D. C does not sit next to D. Who sits next to F?", ["B", "E", "C", "A"], 2),
          mk("Circular table. P is next to Q, Q next to R. P opposite S. Who is next to S?", ["R", "Q", "T", "none"], 3), // T or another neighbor
          mk("In row of 5, X is 2nd from right, Y is left of X. Y's minimum position from left?", ["1st", "2nd", "3rd", "4th"], 0),
        ],
      },
      {
        id: "logical-reasoning",
        name: "Logical Reasoning",
        difficulty: "Medium",
        theory: `### 🧩 Logical Reasoning Tips

**Core Concepts:**
- Analogy: matching relations (e.g. Writer : Pen :: Doctor : Stethoscope).
- Odd one out: finding item not matching common category.
- Logical deductions and statement-conclusions.

**Solved Example:**
*Question:* Find odd one: Apple, Banana, Potato, Orange.
*Solution:* Potato is a vegetable, others are fruits.

**Practice Example:**
*Question:* If day before yesterday was Tuesday, what day is day after tomorrow?
*Answer:* Saturday.`,
        questions: [
          mk("Writer : Pen :: Painter : ?", ["Canvas", "Brush", "Color", "Palette"], 1),
          mk("Odd one out: [Eagle, Sparrow, Penguin, Hawk]", ["Eagle", "Sparrow", "Penguin", "Hawk"], 2),
          mk("If Pen is coded as 35, what is Book?", ["43", "45", "47", "50"], 0),
          mk("Statement: All books are heavy. Heavy things are big. Conclusion: All books are big.", ["Valid", "Invalid", "Cannot say", "none"], 0),
          mk("If A > B, B > C, then:", ["A > C", "A < C", "A = C", "none"], 0),
          mk("Odd one out: [Mercury, Venus, Earth, Moon]", ["Mercury", "Venus", "Earth", "Moon"], 3),
          mk("Light : Dark :: Quiet : ?", ["Silent", "Noisy", "Calm", "Slow"], 1),
          mk("Doctor : Hospital :: Teacher : ?", ["School", "Book", "Class", "Office"], 0),
          mk("If a person is 15th from both ends of a row, total people?", ["28", "29", "30", "31"], 1),
          mk("Find odd one: [2, 3, 5, 9]", ["2", "3", "5", "9"], 3), // 9 is composite
        ],
      },
    ],
  },
  {
    id: "verbal",
    name: "Verbal Ability",
    description: "Grammar, vocabulary, comprehension, and sentence correction.",
    icon: "📖",
    gradient: "from-cyan-500/30 to-blue-500/30",
    concepts: [
      {
        id: "synonyms",
        name: "Synonyms",
        difficulty: "Easy",
        theory: `### 📖 Synonyms Concept Sheet

**Rules:**
- Find words with the closest contextual meanings.
- Break down prefix: Bene- (good), Mal- (bad).

**Solved Example:**
*Question:* Synonym of 'Eloquent'.
*Solution:* Eloquent means speaking articulately and persuasively -> Articulate.

**Practice Example:**
*Question:* Synonym of 'Lucid'.
*Answer:* Clear.`,
        questions: [
          mk("Synonym of 'Abundant'", ["Scarce", "Plentiful", "Empty", "Rare"], 1),
          mk("Synonym of 'Diligent'", ["Lazy", "Hardworking", "Slow", "Quiet"], 1),
          mk("Synonym of 'Candid'", ["Hidden", "Frank", "Dull", "Rude"], 1),
          mk("Synonym of 'Eloquent'", ["Silent", "Articulate", "Clumsy", "Boring"], 1),
          mk("Synonym of 'Frugal'", ["Wasteful", "Thrifty", "Generous", "Greedy"], 1),
          mk("Synonym of 'Lucid'", ["Confusing", "Clear", "Dark", "Vague"], 1),
          mk("Synonym of 'Obstinate'", ["Flexible", "Stubborn", "Calm", "Open"], 1),
          mk("Synonym of 'Reluctant'", ["Eager", "Unwilling", "Quick", "Bold"], 1),
          mk("Synonym of 'Tedious'", ["Exciting", "Boring", "Brief", "Easy"], 1),
          mk("Synonym of 'Vivid'", ["Dull", "Bright", "Faded", "Plain"], 1),
        ],
      },
      {
        id: "grammar",
        name: "Sentence Correction",
        difficulty: "Medium",
        theory: `### ✍️ Sentence Correction Guidelines

**Core Grammar Rules:**
- Subject-Verb Agreement: Singular subject -> singular verb.
- Tense check (consistency).
- Parallel structures.

**Solved Example:**
*Question:* 'Each of the boys are present.' Correct?
*Solution:* 'Each' is singular. Correct: 'Each of the boys is present.'

**Practice Example:**
*Question:* 'She prefers tea than coffee.' Correct?
*Answer:* 'She prefers tea to coffee.'`,
        questions: [
          mk("He don't like coffee.", ["doesn't like", "didn't like", "not like", "no correction"], 0),
          mk("She has went home.", ["has gone", "have gone", "going", "no correction"], 0),
          mk("Each of the boys are present.", ["is present", "were present", "are presents", "no correction"], 0),
          mk("I am working here since 2010.", ["have been working", "was working", "had worked", "no correction"], 0),
          mk("He is more taller than me.", ["taller than me", "more tall", "tall than", "no correction"], 0),
          mk("Neither of them are coming.", ["is coming", "were coming", "have coming", "no correction"], 0),
          mk("The news are shocking.", ["is shocking", "were shocking", "have been shocking", "no correction"], 0),
          mk("She prefers tea than coffee.", ["tea to coffee", "tea over", "tea than to", "no correction"], 0),
          mk("Hardly I had reached when it rained.", ["Hardly had I reached", "Hardly I reached", "I hardly reached", "no correction"], 0),
          mk("One should do his duty.", ["one's duty", "their duty", "his/her duty", "no correction"], 0),
        ],
      },
      {
        id: "verbal-ability",
        name: "Verbal Ability",
        difficulty: "Easy",
        theory: `### 📖 Verbal Ability & Comprehension

**Core Focus Areas:**
- Vocabulary (antonyms, idioms).
- One word substitutions.
- Active & Passive voice conversion.

**Solved Example:**
*Question:* Find antonym of 'Barren'.
*Solution:* Barren means infertile -> Antonym is Fertile.

**Practice Example:**
*Question:* One word substitution for 'a person who looks at the bright side of things'.
*Answer:* Optimist.`,
        questions: [
          mk("Antonym of 'Hostile'", ["Friendly", "Mean", "Silent", "Bitter"], 0),
          mk("One word for 'written law of a legislative body'", ["Statute", "Statue", "Scroll", "Dictum"], 0),
          mk("Change to passive: 'The cat chased the mouse.'", ["Mouse was chased by cat", "Mouse chased cat", "Cat is chased by mouse", "none"], 0),
          mk("Meaning of idiom 'Burn the midnight oil'?", ["Work late", "Waste energy", "Cook food", "Sleep early"], 0),
          mk("Find correctly spelled word:", ["Receive", "Recieve", "Receve", "none"], 0),
          mk("Antonym of 'Vague'", ["Clear", "Dark", "Faint", "Vast"], 0),
          mk("One word for 'study of birds'", ["Ornithology", "Biology", "Zoology", "none"], 0),
          mk("Complete: 'The principal spoke ___ the students.'", ["to", "at", "on", "in"], 0),
          mk("Meaning of idiom 'A blessing in disguise'?", ["Good thing seemed bad", "Bad thing seemed good", "Ghost", "none"], 0),
          mk("Meaning of 'Hypocrisy'?", ["Pretending to have morals", "Speaking fast", "Low energy", "none"], 0),
        ],
      },
      {
        id: "reading-comprehension",
        name: "Reading Comprehension",
        difficulty: "Medium",
        theory: `### 📖 Reading Comprehension Concept Sheet

**Core Rules:**
- Read the questions first to know what key facts to scan for in the passage.
- Identify the main theme, tone, and logical flow of the passage.
- Avoid making assumptions not supported by the text.

**Solved Example:**
*Passage:* The Industrial Revolution, which began in the mid-18th century, transformed rural societies into industrial and urban ones.
*Question:* When did the Industrial Revolution begin?
*Solution:* Mid-18th century (directly stated in the passage).`,
        questions: [
          mk("In RC, what is the best first step?", ["Read the questions first", "Read the entire passage slowly", "Skip directly to the end", "Write down all formulas"], 0),
          mk("What does finding the 'tone' of a passage refer to?", ["Author's attitude/emotion", "Volume of the narrator", "Number of characters", "Length of the passage"], 0),
          mk("If a passage discusses 'climate change policies', what is a likely theme?", ["Environmental preservation", "Medieval architecture", "Financial accounting", "Organic farming"], 0),
          mk("What does an 'inference' question require?", ["Drawing logical conclusions from facts", "Copying exact lines", "Translating words", "Finding spelling errors"], 0),
          mk("Passage: 'A group of scientists discovered a new species of frog in the Amazon.' Where was it found?", ["Amazon", "Sahara", "Pacific Ocean", "Siberia"], 0),
          mk("Passage: 'Unlike traditional solar panels, organic photovoltaics are flexible.' What makes them unique?", ["They are flexible", "They are more expensive", "They use fossil fuels", "They are blue"], 0),
          mk("Which of the following is NOT a common RC question type?", ["Algebraic calculation", "Main idea", "Tone identification", "Detail retrieval"], 0),
          mk("Passage: 'The company's revenue surged by 40% in Q3 due to online sales.' What caused the surge?", ["Online sales", "Tax cuts", "New CEO", "Employee layoffs"], 0),
          mk("What is a primary caution in reading comprehension tests?", ["Do not bring outside knowledge not in the text", "Use a calculator", "Translate all words to Latin", "Draw a diagram of every sentence"], 0),
          mk("If the author criticizes a policy throughout a text, the tone is:", ["Critical", "Approving", "Humorous", "Neutral"], 0),
        ],
      },
    ],
  },
  {
    id: "data",
    name: "Data Interpretation",
    description: "Charts, tables, graphs, and analytical data reasoning.",
    icon: "📊",
    gradient: "from-green-500/30 to-cyan-500/30",
    concepts: [
      {
        id: "tables",
        name: "Table Charts",
        difficulty: "Medium",
        theory: `### 📊 Table Charts Concept Sheet

**Core Math Checklist:**
- Average = Sum / Count.
- Percentage growth = $\\frac{\\text{Diff}}{\\text{Original}} \\times 100$.

**Solved Example:**
*Question:* If sales are [100, 150, 200, 250], average sales?
*Solution:* Sum = 700, Count = 4. Average = 700 / 4 = 175.

**Practice Example:**
*Question:* Find percentage growth from 100 to 150.
*Answer:* 50%.`,
        questions: [
          mk("If sales = [100,150,200,250], avg = ?", ["150", "175", "200", "225"], 1),
          mk("Total of 100+150+200+250", ["650", "700", "750", "800"], 1),
          mk("% growth from 100 to 150", ["25%", "40%", "50%", "60%"], 2),
          mk("Highest in [120,80,90,110]", ["80", "90", "110", "120"], 3),
          mk("Median of [10,20,30,40,50]", ["20", "25", "30", "35"], 2),
          mk("Range of [5,10,25,40]", ["35", "40", "30", "25"], 0),
          mk("Mode of [2,2,3,4,5]", ["2", "3", "4", "5"], 0),
          mk("If Q1=200, Q2=300, growth?", ["25%", "33%", "50%", "66%"], 2),
          mk("Sum of 25+35+45+55", ["140", "150", "160", "170"], 2),
          mk("Average of 10,20,30", ["15", "20", "25", "30"], 1),
        ],
      },
      {
        id: "data-interpretation",
        name: "Data Interpretation",
        difficulty: "Medium",
        theory: `### 📊 Data Interpretation Tips

**Core Concepts:**
- Reading Bar graphs, Pie charts, and Line graphs.
- Ratio comparisons across years.
- High speed arithmetic estimations.

**Solved Example:**
*Question:* If a company spends 30% of ₹10,000 on salaries, find salary amount.
*Solution:* $0.30 \\times 10000 = ₹3000$.

**Practice Example:**
*Question:* In a pie chart, a sector represents 25%. What is the central angle?
*Answer:* 90 degrees ($0.25 \\times 360$).`,
        questions: [
          mk("Central angle of 20% sector in pie chart?", ["72°", "90°", "108°", "120°"], 0),
          mk("Company profit doubles from ₹50L to ₹100L. Growth?", ["50%", "100%", "150%", "200%"], 1),
          mk("Spend ₹4000 on rent, ₹1000 on food. Ratio Rent:Food?", ["4:1", "1:4", "3:1", "1:3"], 0),
          mk("If salary spend increases by 10% on ₹50000, new spend?", ["₹52000", "₹54000", "₹55000", "₹60000"], 2),
          mk("Ratio of imports to exports is 1.25. If imports = ₹500, exports?", ["₹400", "₹450", "₹500", "₹600"], 0),
          mk("Spend in 2020 = ₹10L, in 2021 = ₹12L. Growth %?", ["10%", "15%", "20%", "25%"], 2),
          mk("Total angle of pie chart is:", ["180°", "270°", "360°", "400°"], 2),
          mk("Spend is [12, 18, 15, 25]. Highest spending month relative index (1-4)?", ["1", "2", "3", "4"], 3),
          mk("Average of spends [10, 20, 30] is:", ["15", "20", "25", "30"], 1),
          mk("If a sector of pie chart is 90°, it represents:", ["20%", "25%", "30%", "45%"], 1),
        ],
      },
    ],
  },
];

export const dailyQuiz: Question[] = [
  mk("15% of 200 = ?", ["20", "25", "30", "35"], 2),
  mk("Next in series: 1, 4, 9, 16, ?", ["20", "24", "25", "30"], 2),
  mk("Synonym of 'Rapid'", ["Slow", "Fast", "Calm", "Heavy"], 1),
  mk("CP=400, SP=500. Profit%?", ["20%", "25%", "30%", "33%"], 1),
  mk("If A=1, B=2 ... Z=26, sum of CAB?", ["6", "8", "9", "10"], 0),
];

export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const getConcept = (catId: string, conceptId: string) =>
  getCategory(catId)?.concepts.find((c) => c.id === conceptId);
