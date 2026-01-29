import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SchemaMarkup, PersonSchema } from "./SchemaMarkup";
import { ExternalLink, Linkedin, Twitter } from "lucide-react";

export interface AuthorInfo {
  name: string;
  jobTitle: string;
  bio: string;
  avatar?: string;
  experience?: string;
  expertise?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  company?: {
    name: string;
    url?: string;
  };
}

interface AuthorBioProps {
  author: AuthorInfo;
  publishDate?: string;
  updateDate?: string;
  className?: string;
}

/**
 * E-E-A-T Author Bio Component
 * Enhances trust signals for both Google and AI platforms
 * Shows real expertise and experience for credibility
 */
export const AuthorBio = ({
  author,
  publishDate,
  updateDate,
  className = "",
}: AuthorBioProps) => {
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const personSchema: PersonSchema = {
    type: "Person",
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.bio,
    image: author.avatar,
    url: author.socialLinks?.website,
    sameAs: [
      author.socialLinks?.linkedin,
      author.socialLinks?.twitter,
    ].filter(Boolean) as string[],
    worksFor: author.company
      ? { name: author.company.name, url: author.company.url }
      : undefined,
    knowsAbout: author.expertise,
  };

  return (
    <>
      <SchemaMarkup schemas={[personSchema]} />
      
      <div
        className={`bg-muted/30 rounded-xl p-6 border border-border ${className}`}
        itemScope
        itemType="https://schema.org/Person"
      >
        {/* Header with avatar and basic info */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            {author.avatar && (
              <AvatarImage
                src={author.avatar}
                alt={author.name}
                itemProp="image"
              />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className="font-semibold text-lg text-foreground"
                itemProp="name"
              >
                {author.name}
              </h4>
              {author.experience && (
                <Badge variant="secondary" className="text-xs">
                  {author.experience} tajriba
                </Badge>
              )}
            </div>

            <p
              className="text-sm text-muted-foreground"
              itemProp="jobTitle"
            >
              {author.jobTitle}
              {author.company && (
                <span itemProp="worksFor" itemScope itemType="https://schema.org/Organization">
                  {" "}• <span itemProp="name">{author.company.name}</span>
                </span>
              )}
            </p>

            {/* Social links */}
            {author.socialLinks && (
              <div className="flex items-center gap-3 mt-2">
                {author.socialLinks.linkedin && (
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`${author.name} LinkedIn profili`}
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {author.socialLinks.twitter && (
                  <a
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`${author.name} Twitter profili`}
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {author.socialLinks.website && (
                  <a
                    href={author.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`${author.name} shaxsiy sayti`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <p
          className="text-sm text-muted-foreground mt-4 leading-relaxed"
          itemProp="description"
        >
          {author.bio}
        </p>

        {/* Expertise tags */}
        {author.expertise && author.expertise.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {author.expertise.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs"
                itemProp="knowsAbout"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {/* Publication dates for freshness signals */}
        {(publishDate || updateDate) && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            {publishDate && (
              <time dateTime={publishDate} itemProp="datePublished">
                📅 Nashr: {new Date(publishDate).toLocaleDateString("uz-UZ")}
              </time>
            )}
            {updateDate && (
              <time dateTime={updateDate} itemProp="dateModified">
                🔄 Yangilangan: {new Date(updateDate).toLocaleDateString("uz-UZ")}
              </time>
            )}
          </div>
        )}
      </div>
    </>
  );
};
