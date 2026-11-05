"""Personalised nutrition engine.

Combines Mifflin-St Jeor BMR, an activity multiplier and the user's goal to
produce daily calorie/macro targets, then adjusts them for the calories burned
in the session that was just completed. Finally it builds bilingual meal
suggestions so the user knows what to actually eat after training.
"""

from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional

from app.services.exercise_catalog import EXERCISE_CATALOG

ACTIVITY_MULTIPLIERS: Dict[str, float] = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

GOAL_CALORIE_ADJUSTMENT: Dict[str, int] = {
    "lose_fat": -400,
    "maintain": 0,
    "build_muscle": 300,
}

# Protein target in grams per kilogram of bodyweight for each goal.
GOAL_PROTEIN_PER_KG: Dict[str, float] = {
    "lose_fat": 2.0,
    "maintain": 1.6,
    "build_muscle": 1.9,
}


def _bmr(gender: str, weight_kg: float, height_cm: float, age: int) -> float:
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    return base + (5 if gender == "male" else -161)


def build_nutrition_plan(profile: dict, workout_calories: float = 0.0, exercises_done: List[str] = None) -> dict:
    exercises_done = exercises_done or []

    bmr = _bmr(profile["gender"], profile["weight_kg"], profile["height_cm"], profile["age"])
    tdee = bmr * ACTIVITY_MULTIPLIERS.get(profile["activity_level"], 1.55)

    goal = profile["goal"]
    target_calories = tdee + GOAL_CALORIE_ADJUSTMENT.get(goal, 0)

    # Recover part of the session burn with extra carbs (half of burned calories).
    calorie_credit = workout_calories * 0.5
    effective_calories = target_calories + calorie_credit

    protein_g = GOAL_PROTEIN_PER_KG.get(goal, 1.6) * profile["weight_kg"]
    if "build_muscle" in (goal,):
        protein_g *= 1.05

    fat_g = effective_calories * 0.25 / 9.0
    carbs_g = max(0.0, (effective_calories - protein_g * 4 - fat_g * 9) / 4.0)
    water_liters = round(profile["weight_kg"] * 0.033 + workout_calories * 0.001, 1)

    meals = _build_meals(profile, protein_g, carbs_g, exercises_done)
    insight_en, insight_hi = _build_insights(profile, workout_calories, protein_g, exercises_done)

    return {
        "bmr": round(bmr),
        "tdee": round(tdee),
        "target_calories": round(effective_calories),
        "workout_calories_burned": round(workout_calories),
        "macros": {
            "calories": round(effective_calories),
            "protein_g": round(protein_g),
            "carbs_g": round(carbs_g),
            "fat_g": round(fat_g),
            "water_liters": water_liters,
        },
        "hydration_note_en": f"Drink about {water_liters} L of water today, sip 250 ml every 20 minutes during training.",
        "hydration_note_hi": f"Aaj lagbhag {water_liters} L paani piyo, training ke dauraan har 20 minute me 250 ml piyo.",
        "insight_en": insight_en,
        "insight_hi": insight_hi,
        "meals": meals,
    }


def _build_meals(profile: dict, protein_g: float, carbs_g: float, exercises_done: List[str]) -> List[dict]:
    heavy_day = len(exercises_done) >= 2
    per_meal_protein = round(protein_g / 4)

    meals = [
        {
            "slot": "breakfast",
            "title_en": "Protein-led breakfast",
            "title_hi": "Protein wala breakfast",
            "items_en": ["4 egg whites + 1 whole egg", "50 g oats with milk", "1 banana"],
            "items_hi": ["4 egg white + 1 pura anda", "50 g oats doodh ke saath", "1 kela"],
            "protein_g": per_meal_protein,
        },
        {
            "slot": "lunch",
            "title_en": "Balanced lunch",
            "title_hi": "Santulit lunch",
            "items_en": ["150 g chicken / paneer / dal", "1 cup brown rice or 2 rotis", "Salad + curd"],
            "items_hi": ["150 g chicken / paneer / dal", "1 cup brown rice ya 2 roti", "Salad + dahi"],
            "protein_g": per_meal_protein,
        },
        {
            "slot": "snack",
            "title_en": "Post-workout snack",
            "title_hi": "Workout ke baad ka snack",
            "items_en": ["1 scoop whey or 200 g curd", "Handful of almonds", "1 fruit"],
            "items_hi": ["1 scoop whey ya 200 g dahi", "Ek mutthi badam", "1 phal"],
            "protein_g": per_meal_protein,
        },
        {
            "slot": "dinner",
            "title_en": "Light, high-protein dinner",
            "title_hi": "Halka, high-protein dinner",
            "items_en": ["150 g fish / soya / paneer", "Sauteed vegetables", "1 roti or quinoa"],
            "items_hi": ["150 g fish / soya / paneer", "Bhuni sabziyan", "1 roti ya quinoa"],
            "protein_g": per_meal_protein,
        },
    ]

    if heavy_day:
        meals.append({
            "slot": "recovery",
            "title_en": "Recovery add-on",
            "title_hi": "Recovery ke liye extra",
            "items_en": ["1 banana + 200 ml milk before bed", "Extra 30 g nuts"],
            "items_hi": ["Sone se pehle 1 kela + 200 ml doodh", "Extra 30 g dry fruits"],
            "protein_g": round(per_meal_protein * 0.4),
        })
    return meals


def _build_insights(profile: dict, workout_calories: float, protein_g: float, exercises_done: List[str]):
    goal = profile["goal"]
    weight = profile["weight_kg"]

    insight_en = [
        f"You burnt about {round(workout_calories)} kcal in this session — great work!",
        f"Take in roughly {round(protein_g)} g protein today ({round(protein_g / weight, 1)} g per kg bodyweight) to protect and build muscle.",
    ]
    insight_hi = [
        f"Is session me aapne lagbhag {round(workout_calories)} kcal jalayi — badhiya!",
        f"Aaj lagbhag {round(protein_g)} g protein lo ({round(protein_g / weight, 1)} g per kg bodyweight) taaki muscle bane aur bachi rahe.",
    ]

    if not exercises_done:
        insight_en.append("Try to complete at least one full exercise so we can tailor tomorrow's plan.")
        insight_hi.append("Kam se kam ek exercise poora karo taaki kal ka plan aapke hisaab se bana sakein.")
    elif goal == "lose_fat":
        insight_en.append("Stay in this mild calorie deficit and keep protein high — that combination is what actually removes fat.")
        insight_hi.append("Is halke calorie deficit me raho aur protein zyada rakho — isse hi fat actually kam hoti hai.")
    elif goal == "build_muscle":
        insight_en.append("Eat in a small surplus and train close to failure for steady muscle growth.")
        insight_hi.append("Thoda surplus me khao aur failure ke paas train karo — muscle dheere-dheere badhega.")
    else:
        insight_en.append("Maintain this consistency for energy, strength and long-term health.")
        insight_hi.append("Isko isi tarah continue rakho — energy, strength aur health ke liye best hai.")

    return insight_en, insight_hi


def calories_for_exercise(exercise: dict, achieved_value: float, average_form: float = 100.0) -> float:
    """Calories burned, mildly scaled down by form quality."""
    if exercise["mode"] == "time":
        base = exercise["calories_per_second"] * achieved_value
    else:
        base = exercise["calories_per_rep"] * achieved_value
    form_factor = 0.75 + 0.25 * (max(0.0, min(100.0, average_form)) / 100.0)
    return round(base * form_factor, 2)


# --------------------------------------------------------------------------- #
# Smart coaching: auto-detect the training pattern from history, then suggest
# supplements to take, supplements to skip, foods to eat and foods to avoid.
# --------------------------------------------------------------------------- #
GOAL_LABEL = {
    "lose_fat": ("fat loss", "fat loss"),
    "maintain": ("staying fit", "fit rehne"),
    "build_muscle": ("building muscle", "muscle banane"),
}

LEVEL_LABEL = {
    "beginner": ("Beginner — still building the habit", "Beginner — abhi aadat ban rahi hai"),
    "intermediate": ("Intermediate — consistent for a few weeks", "Intermediate — kuch hafte se regular"),
    "advanced": ("Advanced — trained and disciplined", "Advanced — trained aur disciplined"),
}


def _parse_day(value: str) -> Optional[date]:
    try:
        return date.fromisoformat(str(value)[:10])
    except (ValueError, TypeError):
        return None


def _current_streak(days: List[date]) -> int:
    if not days:
        return 0
    ordered = sorted(set(days), reverse=True)
    today = datetime.now(timezone.utc).date()
    if (today - ordered[0]).days > 1:
        return 0
    streak = 1
    cursor = ordered[0]
    for nxt in ordered[1:]:
        if nxt == cursor - timedelta(days=1):
            streak += 1
            cursor = nxt
        else:
            break
    return streak


def detect_training_pattern(sessions: List[dict]) -> dict:
    """Turn raw session rows into a readable training pattern."""
    total_sessions = len(sessions)
    days = [d for d in (_parse_day(s.get("created_at", "")) for s in sessions) if d]
    training_days = len(set(days))
    streak = _current_streak(days)
    total_minutes = round(sum(float(s.get("duration_sec", 0) or 0) for s in sessions) / 60.0, 1)
    average_form = round(
        sum(float(s.get("average_form", 0) or 0) for s in sessions) / total_sessions
    ) if total_sessions else 0

    if total_sessions < 3:
        level = "beginner"
    elif total_sessions < 12:
        level = "intermediate"
    else:
        level = "advanced"

    counts: Dict[str, int] = {}
    for s in sessions:
        key = s.get("exercise_id")
        if key:
            counts[key] = counts.get(key, 0) + 1

    detected = [
        {
            "id": key,
            "name": EXERCISE_CATALOG[key]["name"],
            "name_hi": EXERCISE_CATALOG[key]["name_hi"],
            "count": count,
        }
        for key, count in sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
        if key in EXERCISE_CATALOG
    ]

    if detected:
        top = EXERCISE_CATALOG[detected[0]["id"]]
        muscles = ", ".join(top["target_muscles"][:3])
        focus_en = f"{top['name']} — {muscles}"
        focus_hi = f"{top['name']} — {muscles}"
    else:
        focus_en = "No movement detected yet"
        focus_hi = "Abhi koi exercise detect nahi hui"

    if days:
        gap = (datetime.now(timezone.utc).date() - max(days)).days
        if gap <= 0:
            last_en, last_hi = "Trained today", "Aaj train kiya"
        elif gap == 1:
            last_en, last_hi = "Trained yesterday", "Kal train kiya"
        else:
            last_en, last_hi = f"Last trained {gap} days ago", f"Aakhri baar {gap} din pehle train kiya"
    else:
        last_en, last_hi = "No sessions yet", "Abhi koi session nahi"

    level_en, level_hi = LEVEL_LABEL[level]

    return {
        "total_sessions": total_sessions,
        "training_days": training_days,
        "current_streak": streak,
        "total_minutes": total_minutes,
        "average_form": average_form,
        "level": level,
        "level_en": level_en,
        "level_hi": level_hi,
        "exercises": detected,
        "focus_en": focus_en,
        "focus_hi": focus_hi,
        "last_trained_en": last_en,
        "last_trained_hi": last_hi,
    }


def _product(pid, name, cat_en, cat_hi, why_en, why_hi, dose_en, dose_hi, priority, icon) -> dict:
    return {
        "id": pid,
        "name": name,
        "category_en": cat_en,
        "category_hi": cat_hi,
        "why_en": why_en,
        "why_hi": why_hi,
        "dosage_en": dose_en,
        "dosage_hi": dose_hi,
        "priority": priority,
        "icon": icon,
    }


def _build_supplements(profile: dict, pattern: dict, protein_g: float) -> tuple:
    goal = profile["goal"]
    weight = profile["weight_kg"]
    training_days = pattern["training_days"]
    level = pattern["level"]

    take: List[dict] = []
    skip: List[dict] = []

    # --- Whey protein -------------------------------------------------------- #
    whey_priority = "essential" if (goal == "build_muscle" or protein_g >= weight * 1.7) else "recommended"
    take.append(_product(
        "whey", "Whey Protein", "Protein supplement", "Protein supplement",
        f"Your daily protein target is about {round(protein_g)} g. Indian food alone rarely gets you there on busy days.",
        f"Aapka roz ka protein target lagbhag {round(protein_g)} g hai. Sirf ghar ke khaane se busy din me ye poora karna mushkil hota hai.",
        "1 scoop (24-30 g) after training with water or milk.",
        "Training ke baad 1 scoop (24-30 g) paani ya doodh ke saath.",
        whey_priority, "protein",
    ))

    # --- Creatine ------------------------------------------------------------ #
    if goal == "build_muscle" or level != "beginner":
        take.append(_product(
            "creatine", "Creatine Monohydrate", "Strength & power", "Strength aur power",
            "The most researched strength supplement. It helps you push more reps with the same effort.",
            "Sabse zyada research wala strength supplement. Isse same mehnat me zyada reps nikalte hain.",
            "3-5 g daily, any time — consistency matters more than timing.",
            "Roz 3-5 g, kabhi bhi — timing se zyada consistency zaroori hai.",
            "recommended", "creatine",
        ))

    # --- Omega 3 ------------------------------------------------------------- #
    if training_days >= 3:
        take.append(_product(
            "omega3", "Omega-3 Fish Oil", "Joint & recovery", "Joints aur recovery",
            "You train often, so joint support and faster recovery help you keep the streak alive.",
            "Aap kaafi train karte ho, isliye joint support aur tez recovery se streak bani rehti hai.",
            "1 capsule (1000 mg EPA+DHA) with a meal, once daily.",
            "Khaane ke saath 1 capsule (1000 mg EPA+DHA), roz ek baar.",
            "recommended", "omega",
        ))

    # --- Vitamin D3 ---------------------------------------------------------- #
    take.append(_product(
        "vitamin_d", "Vitamin D3", "Micronutrient", "Micronutrient",
        "Most people who train indoors are low on vitamin D, which quietly hurts strength and immunity.",
        "Ghar ke andar train karne walon me vitamin D aksar kam hota hai, jo strength aur immunity kam karta hai.",
        "1000-2000 IU daily with a fatty meal.",
        "Roz 1000-2000 IU, tel/fat wale khaane ke saath.",
        "recommended" if training_days >= 2 else "optional", "vitamin",
    ))

    # --- Electrolytes / ORS -------------------------------------------------- #
    if goal == "lose_fat" or pattern["total_minutes"] >= 20:
        take.append(_product(
            "electrolytes", "Electrolyte / ORS Powder", "Hydration", "Hydration",
            "You sweat out sodium and potassium. Replacing them stops the post-workout fatigue and cramps.",
            "Pasine ke saath sodium-potassium nikal jaata hai. Isse workout ke baad thakan aur cramps rukte hain.",
            "1 sachet in 500 ml water during or after training.",
            "Training ke dauraan ya baad me 500 ml paani me 1 sachet.",
            "recommended", "hydration",
        ))

    # --- Multivitamin -------------------------------------------------------- #
    take.append(_product(
        "multivitamin", "Multivitamin", "Micronutrient", "Micronutrient",
        "A cheap safety net on days when meals are rushed or repetitive.",
        "Jin dino khaana jaldi-jaldi ya repeat ho jaata hai, un dino ke liye sasta safety net.",
        "1 tablet daily with breakfast.",
        "Roz breakfast ke saath 1 tablet.",
        "optional", "multivitamin",
    ))

    # --- Things you do NOT need --------------------------------------------- #
    skip.append(_product(
        "bcaa", "BCAA", "Not needed", "Zaroori nahi",
        "Redundant if you already hit your protein target — whey already has all the amino acids.",
        "Agar protein target poora ho raha hai to ye redundant hai — whey me already saare amino acids hain.",
        "Save the money, buy real food instead.",
        "Paise bachao, uske bajaye asli khaana kharido.",
        "optional", "avoid",
    ))
    skip.append(_product(
        "fat_burner", "Fat Burners", "Not needed", "Zaroori nahi",
        "Little to no proven effect and often loaded with stimulants. A calorie deficit does the real work.",
        "Iska koi pakka fayda nahi aur isme stimulants zyada hote hain. Asli kaam calorie deficit karta hai.",
        "Skip it — your training and diet are already doing the job.",
        "Chhodo — aapki training aur diet already kaam kar rahi hai.",
        "optional", "avoid",
    ))
    skip.append(_product(
        "mass_gainer", "Mass Gainer", "Not needed", "Zaroori nahi",
        "Mostly cheap sugar and maltodextrin. Real food plus whey builds better quality muscle.",
        "Isme zyadatar sasta sugar aur maltodextrin hota hai. Asli khaana aur whey behtar muscle banate hain.",
        "Prefer rice, oats, milk and whey instead.",
        "Iske bajaye chawal, oats, doodh aur whey lo.",
        "optional", "avoid",
    ))
    skip.append(_product(
        "test_booster", "Testosterone Boosters", "Avoid", "Avoid karo",
        "No reliable evidence and can be risky. Do not waste money or health on these.",
        "Koi bharosa layak proof nahi aur risk ho sakta hai. In par paisa ya health barbaad na karo.",
        "Not recommended at any level.",
        "Kisi bhi level par recommend nahi.",
        "optional", "avoid",
    ))
    if level == "beginner":
        skip.append(_product(
            "high_stim", "High-Stim Pre-Workout", "Not needed yet", "Abhi zaroori nahi",
            "As a beginner your body responds to good sleep and food. Heavy caffeine will only disturb it.",
            "Beginner ho to body achhi neend aur khaane se hi respond karti hai. Zyada caffeine isko bigaadta hai.",
            "Start with black coffee 20 min before training, if you want a boost.",
            "Boost chahiye to training se 20 min pehle black coffee kaafi hai.",
            "optional", "avoid",
        ))

    return take, skip


def _food_lists(profile: dict) -> tuple:
    goal = profile["goal"]

    eat_en = [
        "Eggs & egg whites — the cheapest complete protein",
        "Paneer, curd / Greek yogurt, milk",
        "Dal, rajma, chana, soya chunks",
        "Chicken, fish or lean meat",
        "Oats, brown rice, roti, poha",
        "Banana, apple and seasonal fruit",
        "Almonds, walnuts and seeds",
        "Spinach, broccoli and salad vegetables",
    ]
    eat_hi = [
        "Ande aur egg white — sabse sasta complete protein",
        "Paneer, dahi / Greek yogurt, doodh",
        "Dal, rajma, chana, soya chunks",
        "Chicken, fish ya lean meat",
        "Oats, brown rice, roti, poha",
        "Kela, seb aur seasonal phal",
        "Badam, akhrot aur seeds",
        "Palak, broccoli aur salad sabziyan",
    ]

    avoid_en = [
        "Maida, bakery items and white bread",
        "Cold drinks, packaged juices and energy drinks",
        "Deep-fried and street junk food",
        "Sweets and desserts on a daily basis",
        "Alcohol and tobacco",
        "Heavy oily meals right before bed",
    ]
    avoid_hi = [
        "Maida, bakery items aur white bread",
        "Cold drinks, packaged juice aur energy drinks",
        "Deep-fried aur bahar ka junk food",
        "Roz-marra ke sweets aur desserts",
        "Alcohol aur tobacco",
        "Sone se theek pehle bhaari oily khaana",
    ]

    if goal == "lose_fat":
        eat_en.insert(4, "High-fibre salads and a protein source in every meal")
        eat_hi.insert(4, "Har meal me high-fibre salad aur ek protein source")
        avoid_en.insert(0, "Sugary 'diet' biscuits, fruit juices and late-night snacking")
        avoid_hi.insert(0, "Sugar wale 'diet' biscuit, fruit juice aur raat ko snack karna")
    elif goal == "build_muscle":
        eat_en.insert(4, "Rice, potato and banana to top up your carbs")
        eat_hi.insert(4, "Chawal, aalu aur kela — carbs badhane ke liye")
        avoid_en.insert(0, "Skipping meals — never train or sleep on an empty tank")
        avoid_hi.insert(0, "Meal skip karna — bhookhe pet train ya sone mat jao")
    else:
        eat_en.insert(0, "A protein source in every meal to hold on to muscle")
        eat_hi.insert(0, "Har meal me ek protein source, muscle bachane ke liye")
        avoid_en.append("Skipping breakfast — it sets up the whole day")
        avoid_hi.append("Breakfast skip karna — isse poora din decide hota hai")

    return eat_en, eat_hi, avoid_en, avoid_hi


def _recovery_list(pattern: dict) -> tuple:
    recovery_en = [
        "Sleep 7-9 hours — this is where muscle actually grows",
        "5-10 minutes of stretching after every session",
        "Eat protein within 60 minutes of training",
        "Keep one full rest day each week",
        "Warm up for 5 minutes before your first rep",
        "Sip water through the session, do not gulp it at the end",
    ]
    recovery_hi = [
        "7-9 ghante ki neend — muscle asal me yahin banta hai",
        "Har session ke baad 5-10 minute stretching",
        "Training ke 60 minute ke andar protein lo",
        "Hafte me ek pura rest day rakho",
        "Pehli rep se pehle 5 minute warm-up",
        "Session ke dauraan paani sip karte raho, aakhir me ek saath nahi",
    ]

    if pattern["current_streak"] >= 5:
        recovery_en.append("You are on a long streak — take a light day before your body forces one")
        recovery_hi.append("Aap lambi streak par ho — body majboor karne se pehle ek halka din le lo")
    if pattern["average_form"] < 75 and pattern["total_sessions"]:
        recovery_en.append("Your form score is dropping — reduce reps and focus on control")
        recovery_hi.append("Form score gir raha hai — reps kam karo aur control par dhyaan do")
    if pattern["training_days"] >= 5:
        recovery_en.append("Add one mobility or walk-only day to protect your joints")
        recovery_hi.append("Ek mobility ya sirf walk wala din jodo, joints bachane ke liye")

    return recovery_en, recovery_hi


def build_advice(profile: dict, sessions: List[dict]) -> dict:
    """Full post-workout intelligence payload."""
    pattern = detect_training_pattern(sessions)

    goal_label_en, goal_label_hi = GOAL_LABEL.get(profile["goal"], ("staying fit", "fit rehne"))
    protein_g = GOAL_PROTEIN_PER_KG.get(profile["goal"], 1.6) * profile["weight_kg"]
    target_protein = round(protein_g)

    supplements, not_needed = _build_supplements(profile, pattern, protein_g)
    eat_en, eat_hi, avoid_en, avoid_hi = _food_lists(profile)
    recovery_en, recovery_hi = _recovery_list(pattern)

    water = round(profile["weight_kg"] * 0.033 + pattern["total_minutes"] * 0.02, 1)
    hydration_en = f"Based on your training load, aim for about {water} L of water today, spread across the day."
    hydration_hi = f"Aapki training ke hisaab se aaj lagbhag {water} L paani piyo, poore din me thoda-thoda."

    summary_en = (
        f"Detected: {pattern['training_days']} training day(s), a {pattern['current_streak']}-day streak, "
        f"{pattern['total_sessions']} total session(s) and an average form of {pattern['average_form']}%. "
        f"Your top focus is {pattern['focus_en']}, and your goal is {goal_label_en}. "
        f"Hit about {target_protein} g of protein today and use only the supplements listed below — "
        f"everything else is money you can keep."
    )
    summary_hi = (
        f"Detect hua: {pattern['training_days']} training day, {pattern['current_streak']}-din ki streak, "
        f"kul {pattern['total_sessions']} session aur average form {pattern['average_form']}%. "
        f"Aapka main focus {pattern['focus_hi']} hai aur goal {goal_label_hi} hai. "
        f"Aaj lagbhag {target_protein} g protein lo aur sirf neeche diye supplements lo — "
        f"baaki sab paise bachane wali cheezein hain."
    )

    return {
        "pattern": pattern,
        "protein_target_g": target_protein,
        "summary_en": summary_en,
        "summary_hi": summary_hi,
        "supplements": supplements,
        "not_needed": not_needed,
        "eat_en": eat_en,
        "eat_hi": eat_hi,
        "avoid_en": avoid_en,
        "avoid_hi": avoid_hi,
        "hydration_en": hydration_en,
        "hydration_hi": hydration_hi,
        "recovery_en": recovery_en,
        "recovery_hi": recovery_hi,
    }
