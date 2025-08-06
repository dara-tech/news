import { useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables.");
}

export type ProfileImageStyle =
  | "simple"
  | "professional"
  | "army"
  | "police"
  | "fire"
  | "doctor"
  | "nurse"
  | "teacher"
  | "student"
  | "principal"
  | "creative"
  | "gaming"
  | "minimalist"
  | "corporate"
  | "tech"
  | "artistic"
  | "mood"
  | "mood2"
  | "mood3"
  | "mood4"
  | "engineer"
  | "scientist"
  | "lawyer"
  | "accountant"
  | "chef"
  | "pilot"
  | "architect"
  | "designer"
  | "writer"
  | "journalist"
  | "photographer"
  | "musician"
  | "artist"
  | "dentist"
  | "veterinarian"
  | "pharmacist"
  | "psychologist"
  | "counselor"
  | "social_worker"
  | "librarian"
  | "translator"
  | "interpreter"
  | "tour_guide"
  | "flight_attendant"
  | "waiter"
  | "bartender"
  | "receptionist"
  | "secretary"
  | "salesperson"
  | "marketing"
  | "hr"
  | "consultant"
  | "entrepreneur"
  | "investor"
  | "banker"
  | "insurance"
  | "real_estate"
  | "construction"
  | "plumber"
  | "electrician"
  | "mechanic"
  | "carpenter"
  | "painter"
  | "gardener"
  | "farmer"
  | "fisherman"
  | "miner"
  | "factory_worker"
  | "driver"
  | "delivery"
  | "security"
  | "detective"
  | "judge"
  | "prosecutor"
  | "defense_attorney"
  | "paralegal"
  | "court_clerk"
  | "bailiff"
  | "correctional_officer"
  | "probation_officer"
  | "mediator"
  | "arbitrator"
  | "notary"
  | "legal_assistant"
  | "court_reporter"
  | "process_server"
  | "bounty_hunter"
  | "private_investigator"
  | "forensic_scientist"
  | "crime_scene_technician"
  | "fingerprint_analyst"
  | "ballistics_expert"
  | "toxicologist"
  | "pathologist"
  | "medical_examiner"
  | "coroner"
  | "embalmer"
  | "funeral_director"
  | "cemetery_worker"
  | "crematory_operator"
  | "grief_counselor"
  | "bereavement_coordinator"
  | "memorial_planner"
  | "headstone_engraver"
  | "florist"
  | "caterer"
  | "event_planner"
  | "wedding_planner"
  | "party_planner"
  | "decorator"
  | "interior_designer"
  | "landscape_architect"
  | "urban_planner"
  | "surveyor"
  | "cartographer"
  | "geologist"
  | "meteorologist"
  | "astronomer"
  | "physicist"
  | "chemist"
  | "biologist"
  | "botanist"
  | "zoologist"
  | "marine_biologist"
  | "ecologist"
  | "environmental_scientist"
  | "conservationist"
  | "park_ranger"
  | "forest_ranger"
  | "wildlife_biologist"
  | "ornithologist"
  | "entomologist"
  | "herpetologist"
  | "ichthyologist"
  | "mammalogist"
  | "paleontologist"
  | "archaeologist"
  | "anthropologist"
  | "sociologist"
  | "economist"
  | "political_scientist"
  | "historian"
  | "geographer"
  | "demographer"
  | "statistician"
  | "actuary"
  | "data_scientist"
  | "machine_learning_engineer"
  | "ai_researcher"
  | "robotics_engineer"
  | "cybersecurity_analyst"
  | "network_administrator"
  | "database_administrator"
  | "systems_administrator"
  | "devops_engineer"
  | "site_reliability_engineer"
  | "cloud_architect"
  | "solution_architect"
  | "enterprise_architect"
  | "business_analyst"
  | "product_manager"
  | "project_manager"
  | "scrum_master"
  | "agile_coach"
  | "quality_assurance"
  | "test_engineer"
  | "automation_engineer"
  | "performance_engineer"
  | "security_engineer"
  | "penetration_tester"
  | "ethical_hacker"
  | "forensic_analyst"
  | "incident_response"
  | "threat_hunter"
  | "malware_analyst"
  | "reverse_engineer"
  | "cryptographer"
  | "blockchain_developer"
  | "smart_contract_developer"
  | "web3_developer"
  | "nft_artist"
  | "crypto_trader"
  | "mining_operator"
  | "validator"
  | "dealer"
  | "broker"
  | "trader"
  | "analyst"
  | "portfolio_manager"
  | "fund_manager"
  | "hedge_fund_manager"
  | "private_equity"
  | "venture_capitalist"
  | "angel_investor"
  | "startup_founder"
  | "ceo"
  | "cto"
  | "cfo"
  | "coo"
  | "chro"
  | "cmo"
  | "cio"
  | "cso"
  | "cpo"
  | "clco"
  | "board_member"
  | "advisor"
  | "mentor"
  | "coach"
  | "trainer"
  | "instructor"
  | "professor"
  | "lecturer"
  | "researcher"
  | "postdoc"
  | "graduate_student"
  | "undergraduate_student"
  | "high_school_student"
  | "middle_school_student"
  | "elementary_student"
  | "kindergarten_teacher"
  | "special_education"
  | "esl_teacher"
  | "tutor"
  | "media_specialist"
  | "guidance_counselor"
  | "school_psychologist"
  | "speech_therapist"
  | "occupational_therapist"
  | "physical_therapist"
  | "respiratory_therapist"
  | "radiologic_technologist"
  | "laboratory_technician"
  | "phlebotomist"
  | "medical_assistant"
  | "nursing_assistant"
  | "home_health_aide"
  | "personal_care_aide"
  | "dietitian"
  | "nutritionist"
  | "personal_trainer"
  | "fitness_instructor"
  | "yoga_instructor"
  | "pilates_instructor"
  | "massage_therapist"
  | "chiropractor"
  | "acupuncturist"
  | "herbalist"
  | "naturopath"
  | "homeopath"
  | "osteopath"
  | "podiatrist"
  | "optometrist"
  | "ophthalmologist"
  | "audiologist"
  | "speech_pathologist"
  | "cardiovascular_technologist"
  | "neurodiagnostic_technologist"
  | "surgical_technologist"
  | "anesthesia_technologist"
  | "perfusionist"
  | "orthotist"
  | "prosthetist"
  | "orthopedic_technologist"
  | "ophthalmic_technician"
  | "optometric_technician"
  | "ophthalmic_assistant"
  | "optometric_assistant"
  | "ophthalmic_photographer"
  | "ophthalmic_biometrist"
  | "ophthalmic_ultrasonographer"
  | "ophthalmic_angiographer"
  | "ophthalmic_perimetrist"
  | "ophthalmic_tonometrist"
  | "ophthalmic_keratometrist"
  | "ophthalmic_refractionist"
  | "ophthalmic_contact_lens_fitter"
  | "ophthalmic_low_vision_specialist"
  | "ophthalmic_vision_therapist"
  | "ophthalmic_orthoptist"
  | "ophthalmic_oculoplastic_surgeon"
  | "ophthalmic_corneal_surgeon"
  | "ophthalmic_retinal_surgeon"
  | "ophthalmic_glaucoma_surgeon"
  | "ophthalmic_cataract_surgeon"
  | "ophthalmic_refractive_surgeon"
  | "ophthalmic_pediatric_surgeon"
  | "ophthalmic_neuro_surgeon"
  | "ophthalmic_orbital_surgeon"
  | "ophthalmic_lacrimal_surgeon";

export interface ProfileImagePreferences {
  style?: ProfileImageStyle;
  colors?: string[];
  theme?: "light" | "dark" | "colorful" | "monochrome";
  gender?: "male" | "female" | "neutral";
  age?: "young" | "adult" | "senior";
  profession?: string;
  platform?: string;
}

export interface GeneratedProfileImage {
  file: File;
  text: string;
  style: ProfileImageStyle;
  previewUrl: string;
  generatedAt: Date;
}

export function useGenerateProfileImage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{
    current: number;
    total: number;
    style: ProfileImageStyle;
  } | null>(null);

  // Smart style recommendation based on user info
  const recommendStyle = (userInfo: {
    profession?: string;
    interests?: string[];
    personality?: string;
    platform?: string;
  }): ProfileImageStyle => {
    const { profession, interests, personality, platform } = userInfo;
    
    // Profession-based recommendations
    if (profession) {
      const professionMap: Record<string, ProfileImageStyle> = {
        "software developer": "tech",
        "designer": "designer",
        "artist": "artistic",
        "musician": "musician",
        "teacher": "teacher",
        "doctor": "doctor",
        "lawyer": "lawyer",
        "business": "corporate",
        "student": "student",
        "gamer": "gaming",
        "photographer": "photographer",
        "engineer": "engineer",
        "nurse": "nurse",
        "police": "police",
        "military": "army",
        "firefighter": "fire",
        "chef": "chef",
        "pilot": "pilot",
        "scientist": "scientist",
        "writer": "writer",
        "journalist": "journalist",
      };
      
      const lowerProfession = profession.toLowerCase();
      for (const [key, style] of Object.entries(professionMap)) {
        if (lowerProfession.includes(key)) {
          return style;
        }
      }
    }
    
    // Interest-based recommendations
    if (interests && interests.length > 0) {
      const interestMap: Record<string, ProfileImageStyle> = {
        "gaming": "gaming",
        "art": "artistic",
        "music": "musician",
        "technology": "tech",
        "business": "corporate",
        "photography": "photographer",
        "design": "designer",
      };
      
      for (const interest of interests) {
        const lowerInterest = interest.toLowerCase();
        for (const [key, style] of Object.entries(interestMap)) {
          if (lowerInterest.includes(key)) {
            return style;
          }
        }
      }
    }
    
    // Platform-based recommendations
    if (platform) {
      const platformMap: Record<string, ProfileImageStyle> = {
        "linkedin": "professional",
        "github": "tech",
        "twitter": "creative",
        "instagram": "artistic",
        "twitch": "gaming",
        "behance": "designer",
      };
      
      const style = platformMap[platform.toLowerCase()];
      if (style) return style;
    }
    
    // Personality-based fallback
    if (personality) {
      const personalityMap: Record<string, ProfileImageStyle> = {
        "creative": "creative",
        "professional": "professional",
        "energetic": "mood3",
        "calm": "mood2",
        "happy": "mood",
        "thoughtful": "mood4",
      };
      
      const style = personalityMap[personality.toLowerCase()];
      if (style) return style;
    }
    
    // Default recommendation
    return "professional";
  };

  const generateProfileImage = async (
    username: string,
    preferences?: ProfileImagePreferences
  ): Promise<GeneratedProfileImage | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Build a smart prompt for profile image generation
      const style = preferences?.style || "professional";
      
      // Intelligent color selection based on style
      const colors = preferences?.colors?.join(", ") || getSmartColors(style);
      
      // Build enhanced prompt with additional preferences
      const prompt = buildPrompt(username, style, colors, preferences);

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const parts = response?.candidates?.[0]?.content?.parts;
      if (!parts) throw new Error("Invalid response format from the API");

      let imageData: string | null = null;
      let text = "";

      for (const part of parts) {
        if (part.text) text = part.text;
        else if (part.inlineData?.data) imageData = part.inlineData.data;
      }

      if (!imageData) throw new Error("No image data returned from the API");

      // Convert base64 to Blob/File
      const byteString = atob(imageData);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: "image/png" });
      const file = new File(
        [blob],
        `profile-${username.toLowerCase()}-${style}.png`,
        { type: "image/png" }
      );

      // Create preview URL
      const previewUrl = URL.createObjectURL(blob);

      return {
        file,
        text,
        style,
        previewUrl,
        generatedAt: new Date(),
      };
    } catch (error: unknown) {
      let message = "Profile image generation failed. Please try again later.";
      if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Intelligent color palette selection based on style
  const getSmartColors = (style: ProfileImageStyle): string => {
    const colorPalettes: Record<string, string> = {
      // Professional styles
      professional: "#1F2937, #3B82F6, #E5E7EB",
      corporate: "#111827, #4B5563, #2563EB",
      lawyer: "#1F2937, #991B1B, #F3F4F6",
      doctor: "#FFFFFF, #3B82F6, #10B981",
      nurse: "#F0F9FF, #06B6D4, #E0F2FE",
      
      // Emergency services
      army: "#134E4A, #365314, #713F12",
      police: "#1E3A8A, #1F2937, #DC2626",
      fire: "#DC2626, #F59E0B, #1F2937",
      
      // Creative styles
      creative: "#EC4899, #8B5CF6, #06B6D4, #10B981",
      artistic: "#F59E0B, #EC4899, #8B5CF6, #06B6D4",
      designer: "#6366F1, #EC4899, #F3F4F6",
      photographer: "#1F2937, #F59E0B, #EF4444",
      musician: "#7C3AED, #EC4899, #2563EB",
      
      // Tech styles
      tech: "#10B981, #3B82F6, #6366F1, #1F2937",
      engineer: "#2563EB, #F59E0B, #6B7280",
      data_scientist: "#06B6D4, #8B5CF6, #10B981",
      cybersecurity_analyst: "#DC2626, #1F2937, #10B981",
      
      // Education
      teacher: "#3B82F6, #10B981, #F59E0B",
      student: "#6366F1, #EC4899, #10B981",
      principal: "#1E3A8A, #DC2626, #F59E0B",
      
      // Mood-based
      mood: "#F59E0B, #EF4444, #EC4899, #FBBF24",
      mood2: "#06B6D4, #93C5FD, #E0E7FF",
      mood3: "#EF4444, #F59E0B, #10B981, #06B6D4",
      mood4: "#6366F1, #4B5563, #9CA3AF",
      
      // Gaming
      gaming: "#FF6B6B, #4ECDC4, #45B7D1, #A855F7",
      
      // Minimalist
      simple: "#3B82F6, #6B7280",
      minimalist: "#1F2937, #E5E7EB",
    };
    
    return colorPalettes[style] || "#3B82F6, #8B5CF6, #10B981";
  };

  const buildPrompt = (
    username: string,
    style: ProfileImageStyle,
    colors: string,
    preferences?: ProfileImagePreferences
  ): string => {
    // Enhanced style prompts with more detail and personality
    const stylePrompts: Record<string, string> = {
      // Military & Emergency Services
      army: `Create a distinguished military officer avatar for ${username}. Show strength, honor, and leadership with crisp uniform, medals, and confident posture. Military precision meets modern design. Colors: ${colors}. Ultra-realistic, respectful portrayal.`,
      police: `Design a trustworthy police officer avatar for ${username}. Professional law enforcement attire with badge, modern equipment. Approachable yet authoritative presence. Colors: ${colors}. Community-focused, protective stance.`,
      fire: `Craft a heroic firefighter avatar for ${username}. Protective gear, helmet, brave expression. Show courage and dedication with smoke effects or fire station background. Colors: ${colors}. Life-saving hero aesthetic.`,
      
      // Medical Professionals
      doctor: `Generate a compassionate medical doctor avatar for ${username}. White coat, stethoscope, intelligent eyes. Blend expertise with warmth. Modern medical setting hints. Colors: ${colors}. Healing hands, caring expression.`,
      nurse: `Create a caring nurse avatar for ${username}. Medical scrubs, kind smile, professional competence. Show dedication and empathy. Healthcare hero vibes. Colors: ${colors}. Supportive, skilled presence.`,
      dentist: `Design a friendly dentist avatar for ${username}. Clean medical attire, reassuring smile, modern dental tools subtly shown. Professional yet approachable. Colors: ${colors}. Precision meets comfort.`,
      veterinarian: `Craft an animal-loving veterinarian avatar for ${username}. Lab coat with cute animal elements, stethoscope, gentle expression. Pet-friendly atmosphere. Colors: ${colors}. Compassionate animal healer.`,
      pharmacist: `Generate a knowledgeable pharmacist avatar for ${username}. White coat, organized background suggesting pharmacy, trustworthy demeanor. Medical precision. Colors: ${colors}. Healthcare expertise visualization.`,
      
      // Education Professionals
      teacher: `Create an inspiring educator avatar for ${username}. Smart casual attire, book or digital tablet, warm encouraging smile. Classroom elements subtly integrated. Colors: ${colors}. Knowledge sharing enthusiasm.`,
      student: `Design a motivated student avatar for ${username}. Backpack, books, eager expression. Show learning enthusiasm and future potential. Modern academic style. Colors: ${colors}. Growth mindset visualization.`,
      principal: `Craft an authoritative yet approachable principal avatar for ${username}. Professional attire, leadership presence, school pride elements. Educational excellence. Colors: ${colors}. Visionary educator aesthetic.`,
      professor: `Generate a scholarly professor avatar for ${username}. Academic robes or tweed jacket, glasses, intellectual aura. University setting hints. Colors: ${colors}. Wisdom and research excellence.`,
      
      // Creative & Artistic
      creative: `Design an imaginative artist avatar for ${username}. Vibrant outfit, paint splashes, creative tools. Artistic flair with fantasy elements. Imagination unleashed. Colors: ${colors}. Boundless creativity expressed.`,
      artistic: `Create a sophisticated artist avatar for ${username}. Stylish bohemian attire, artistic accessories, inspired expression. Gallery-worthy presence. Colors: ${colors}. Fine arts mastery shown.`,
      designer: `Craft a trendy designer avatar for ${username}. Minimalist chic outfit, design tools, creative workspace hints. Modern aesthetic sensibility. Colors: ${colors}. Design thinking visualized.`,
      photographer: `Generate a visionary photographer avatar for ${username}. Camera around neck, artistic eye, perfect lighting awareness. Capturing life's moments. Colors: ${colors}. Visual storytelling master.`,
      musician: `Design a passionate musician avatar for ${username}. Musical instrument, sound waves, rhythm in posture. Stage presence energy. Colors: ${colors}. Melodic soul expressed.`,
      
      // Tech & Digital
      tech: `Create a cutting-edge tech professional avatar for ${username}. Futuristic elements, code snippets floating, AR/VR hints. Silicon Valley meets cyberpunk. Colors: ${colors}. Digital innovation embodied.`,
      engineer: `Design a problem-solving engineer avatar for ${username}. Hard hat or lab coat, blueprints, analytical expression. Building tomorrow's world. Colors: ${colors}. Technical precision meets creativity.`,
      data_scientist: `Craft a data wizard avatar for ${username}. Visualizations floating around, analytical tools, matrix-like elements. Big data mastery. Colors: ${colors}. Insights from chaos creator.`,
      cybersecurity_analyst: `Generate a digital guardian avatar for ${username}. Hooded figure with code streams, lock symbols, protective stance. Cyber defender aesthetic. Colors: ${colors}. Digital fortress keeper.`,
      
      // Business & Corporate
      corporate: `Create an executive presence avatar for ${username}. Tailored suit, confident posture, city skyline hints. C-suite ready appearance. Colors: ${colors}. Leadership and vision combined.`,
      professional: `Design a polished professional avatar for ${username}. Business attire, organized demeanor, success indicators. Career excellence shown. Colors: ${colors}. Workplace standout presence.`,
      entrepreneur: `Craft an innovative entrepreneur avatar for ${username}. Smart casual, startup energy, lightbulb moments visualized. Disruptive thinker. Colors: ${colors}. Innovation and ambition merged.`,
      ceo: `Generate a commanding CEO avatar for ${username}. Power suit, boardroom presence, visionary gaze. Strategic leadership embodied. Colors: ${colors}. Corporate titan aesthetic.`,
      
      // Legal Professionals
      lawyer: `Create a sharp legal professional avatar for ${username}. Traditional suit, law books, scales of justice subtly shown. Courtroom ready. Colors: ${colors}. Justice advocate presence.`,
      judge: `Design a dignified judge avatar for ${username}. Judicial robes, gavel, wisdom and fairness expressed. Constitutional guardian. Colors: ${colors}. Impartial justice personified.`,
      
      // Service & Hospitality
      chef: `Craft a culinary master avatar for ${username}. Chef's whites, toque, kitchen confidence. Gastronomic artist at work. Colors: ${colors}. Flavor innovation visualized.`,
      pilot: `Generate an aviation professional avatar for ${username}. Pilot uniform, aviator glasses, sky-high confidence. Wings and expertise. Colors: ${colors}. Sky commander aesthetic.`,
      
      // Mood-based Styles
      mood: `Create a radiantly happy avatar for ${username}. Beaming smile, sparkles, positive energy bursting forth. Joy personified with dynamic pose. Colors: ${colors}. Happiness overflowing.`,
      mood2: `Design a zen-like peaceful avatar for ${username}. Meditative pose, soft features, tranquil aura. Inner peace visualized with gentle elements. Colors: ${colors}. Serenity embodied.`,
      mood3: `Craft an explosively energetic avatar for ${username}. Action pose, motion lines, vibrant effects. Unstoppable force of nature. Colors: ${colors}. Pure dynamism captured.`,
      mood4: `Generate a deeply contemplative avatar for ${username}. Thoughtful expression, abstract thoughts visualized, philosophical depth. Intellectual introspection. Colors: ${colors}. Wisdom seeking soul.`,
      
      // Base Styles
      simple: `Create a beautifully minimal avatar for ${username}. Clean lines, elegant simplicity, timeless appeal. Less is more philosophy. Colors: ${colors}. Effortless sophistication.`,
      minimalist: `Design a geometric minimalist avatar for ${username}. Abstract shapes, negative space mastery, essential elements only. Pure form. Colors: ${colors}. Distilled essence captured.`,
      gaming: `Craft an epic gamer avatar for ${username}. RGB lighting, esports aesthetic, controller or keyboard warrior. Victory royale energy. Colors: ${colors}. Game champion presence.`,
    };

    // Intelligent fallback for unlisted professions
    const fallbackPrompts: Record<string, string> = {
      scientist: `Create a brilliant scientist avatar for ${username}. Lab coat, safety goggles, eureka moment captured. Research excellence shown. Colors: ${colors}. Discovery in progress.`,
      architect: `Design a visionary architect avatar for ${username}. Blueprints, modern structures, creative precision. Building dreams visualized. Colors: ${colors}. Structural innovation embodied.`,
      psychologist: `Craft an empathetic psychologist avatar for ${username}. Professional attire, understanding expression, mental wellness advocate. Colors: ${colors}. Mind healer presence.`,
      writer: `Generate a creative writer avatar for ${username}. Surrounded by books, typewriter or laptop, inspired expression. Wordsmith at work. Colors: ${colors}. Stories coming to life.`,
      journalist: `Create an intrepid journalist avatar for ${username}. Press badge, notepad, investigative spirit. Truth seeker aesthetic. Colors: ${colors}. News breaker presence.`,
    };

    // Smart prompt selection with fallback
    let basePrompt = stylePrompts[style] || fallbackPrompts[style];
    
    if (!basePrompt) {
      // Intelligent generic prompt based on style name
      const styleWords = style.replace(/_/g, ' ');
      basePrompt = `Create a professional ${styleWords} avatar for ${username}. Capture the essence of the profession with appropriate attire, tools, and expression. Modern, respectful portrayal. Colors: ${colors}. Excellence in the field shown.`;
    }

    // Add preference modifiers
    let enhancedPrompt = basePrompt;
    
    if (preferences?.gender) {
      const genderMap = {
        male: "masculine features",
        female: "feminine features", 
        neutral: "androgynous features"
      };
      enhancedPrompt += ` Character should have ${genderMap[preferences.gender]}.`;
    }
    
    if (preferences?.age) {
      const ageMap = {
        young: "youthful appearance (20-30 years)",
        adult: "mature professional appearance (30-50 years)",
        senior: "distinguished senior appearance (50+ years)"
      };
      enhancedPrompt += ` Age appearance: ${ageMap[preferences.age]}.`;
    }
    
    if (preferences?.theme) {
      const themeMap = {
        light: "bright, clean, optimistic atmosphere",
        dark: "sophisticated, dramatic, powerful mood",
        colorful: "vibrant, energetic, dynamic palette",
        monochrome: "elegant black and white or grayscale aesthetic"
      };
      enhancedPrompt += ` Visual theme: ${themeMap[preferences.theme]}.`;
    }
    
    if (preferences?.platform) {
      enhancedPrompt += ` Optimized for ${preferences.platform} platform aesthetic.`;
    }

    // Enhanced final prompt with quality instructions
    return `${enhancedPrompt} 

CRITICAL INSTRUCTIONS:
- Ultra high quality, 4K resolution feel
- Perfect for professional social media profiles (LinkedIn, Twitter, GitHub)
- Centered composition with subtle depth
- Clean, non-distracting background with slight gradient or bokeh
- Photorealistic or high-quality illustrated style
- Appropriate lighting that enhances the character
- Ensure the avatar represents diversity and inclusion
- Modern, contemporary aesthetic that won't age quickly
- Subtle branded elements that don't overpower
- Expression should be confident yet approachable
- Avatar should work well as both large profile image and small icon
${preferences?.platform ? `- Specifically optimized for ${preferences.platform} profile dimensions and style` : ''}`;
  };

  // Individual style generators with smart defaults
  const generateSimpleProfileImage = async (
    username: string,
    customPreferences?: Partial<ProfileImagePreferences>
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "simple",
      ...customPreferences,
    });
  };

  const generateProfessionalProfileImage = async (
    username: string,
    customPreferences?: Partial<ProfileImagePreferences>
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "professional",
      ...customPreferences,
    });
  };

  const generateCreativeProfileImage = async (
    username: string,
    customPreferences?: Partial<ProfileImagePreferences>
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "creative",
      ...customPreferences,
    });
  };

  const generateGamingProfileImage = async (
    username: string,
    customPreferences?: Partial<ProfileImagePreferences>
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "gaming",
      ...customPreferences,
    });
  };

  const generateMinimalistProfileImage = async (
    username: string,
    customPreferences?: Partial<ProfileImagePreferences>
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "minimalist",
      ...customPreferences,
    });
  };

  const generateCorporateProfileImage = async (
    username: string,
    customPreferences?: Partial<ProfileImagePreferences>
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "corporate",
      ...customPreferences,
    });
  };

  const generateTechProfileImage = async (
    username: string,
    customPreferences?: Partial<ProfileImagePreferences>
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "tech",
      ...customPreferences,
    });
  };

  const generateArtisticProfileImage = async (
    username: string,
    customPreferences?: Partial<ProfileImagePreferences>
  ): Promise<GeneratedProfileImage | null> => {
    return generateProfileImage(username, {
      style: "artistic",
      ...customPreferences,
    });
  };

  // Batch generation with progress tracking
  const generateBatchProfileImages = async (
    username: string,
    styles: ProfileImageStyle[] = [
      "simple",
      "professional",
      "creative",
      "gaming",
      "minimalist",
      "corporate",
      "tech",
      "artistic",
    ]
  ): Promise<GeneratedProfileImage[]> => {
    setIsGenerating(true);
    setError(null);
    const results: GeneratedProfileImage[] = [];

    try {
      for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        setGenerationProgress({
          current: i + 1,
          total: styles.length,
          style,
        });

        const result = await generateProfileImage(username, { style });
        if (result) {
          results.push(result);
        }

        // Small delay between generations to avoid rate limiting
        if (i < styles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      return results;
    } catch (error: unknown) {
      let message = "Batch generation failed. Please try again later.";
      if (error instanceof Error) {
        message = error.message;
      }
      setError(message);
      return results; // Return partial results
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  return {
    isGeneratingProfileImage: isGenerating,
    profileImageGenerationError: error,
    generationProgress,
    generateProfileImage,
    generateSimpleProfileImage,
    generateProfessionalProfileImage,
    generateCreativeProfileImage,
    generateGamingProfileImage,
    generateMinimalistProfileImage,
    generateCorporateProfileImage,
    generateTechProfileImage,
    generateArtisticProfileImage,
    generateBatchProfileImages,
    recommendStyle,
    getSmartColors,
  };
}