import Link from "next/link";
import { Download } from "lucide-react";
import { routeMeta, SITE_URL } from "@/lib/site";
import { FOUNDER_ID, FOUNDER_NAME, ORGANIZATION_ID } from "@/lib/schema";
import { JsonLd } from "@/components/json-ld";
import { Card } from "@/components/ui/card";
import { BarList } from "@/components/research/bar-list";
import { StatTile } from "@/components/research/stat-tile";
import data from "@/lib/research/gift-study-data.json";

const PATH = "/research/ai-gift-recommendations";
const CSV_PATH = "/research/gift-recommendations-3400-personas.csv";
const PUBLISHED = "2026-11-11";

const TITLE = "We Asked an AI for 10,198 Gift Ideas";
const DESCRIPTION =
  "3,400 made-up shoppers, three gift picks each. What an AI recommends when you ask it thousands of times: the repeats, the budget gaps, who gets personalized gifts, and how often a product name is slightly off.";

export const metadata = routeMeta(PATH, TITLE, DESCRIPTION);

const n = (x: number) => x.toLocaleString("en-US");
const usd = (x: number) => (Number.isInteger(x) ? `$${x}` : `$${x.toFixed(2)}`);
const link = "text-amber-700 underline underline-offset-2 hover:text-amber-800";

export default function AiGiftStudyPage() {
  const url = `${SITE_URL}${PATH}`;
  const d = data;
  const kindle = d.topProducts[0];
  const wine = d.topExperiences[0];
  const interests = Object.entries(d.topProductByInterest).sort((a, b) => b[1].share - a[1].share);
  const below250 = (100 - d.budget[4].inBand).toFixed(1);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: "We asked an AI for 10,198 gift ideas",
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    inLanguage: "en-US",
    author: { "@type": "Person", "@id": FOUNDER_ID, name: FOUNDER_NAME, url: `${SITE_URL}/about` },
    publisher: { "@type": "Organization", "@id": ORGANIZATION_ID, name: "The Gift Whisperer", url: SITE_URL },
  };
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    name: "AI gift recommendations for 3,400 synthetic shoppers",
    description:
      "The top three gift picks an AI recommender returned for each of 3,400 synthetic shoppers (10,198 picks), with the shopper's relationship, age band, occasion, budget, interests and gift preference, and a name check for each product.",
    url,
    dateCreated: PUBLISHED,
    creator: { "@type": "Person", "@id": FOUNDER_ID, name: FOUNDER_NAME },
    publisher: { "@type": "Organization", "@id": ORGANIZATION_ID, name: "The Gift Whisperer" },
    keywords: ["gift recommendations", "AI recommendations", "synthetic personas", "gift ideas"],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: `${SITE_URL}${CSV_PATH}`,
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "AI gift recommendations study", item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <JsonLd data={articleSchema} />
      <JsonLd data={datasetSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <nav className="mb-6 text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-800">
            Home
          </Link>
          <span className="mx-2 text-stone-300">/</span>
          <span className="text-stone-700">Research</span>
        </nav>

        <h1 className="font-heading text-4xl leading-tight text-stone-900">
          We asked an AI for {n(d.recommendations)} gift ideas. Here is what it picked.
        </h1>
        <p className="mt-3 text-sm text-stone-400">
          By{" "}
          <Link href="/about" className="hover:text-stone-600">
            Daniel Maghini
          </Link>{" "}
          &middot; November 11, 2026 &middot; Method and data at the bottom
        </p>

        <div className="mt-8 space-y-4 text-base leading-relaxed text-stone-600">
          <p>
            The Gift Whisperer asks a few questions about the person you are shopping for, and an
            AI picks three gifts. I wanted to know what it does across thousands of questions, not
            one or two. So I made up {n(d.personas)} shoppers using the same answers the wizard
            offers (who the gift is for, their age, the occasion, up to two interests, a budget, and
            whether they like things or experiences) and ran every one through the live recommender.
          </p>
          <p>
            Some of what came back was predictable and some of it wasn&apos;t. These are the findings
            I found most interesting, followed by the method and the full data.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile value={n(d.personas)} label="made-up shoppers" />
          <StatTile value={n(d.recommendations)} label="gift picks (top three each)" />
          <StatTile value={n(d.distinctProducts)} label="different products" />
          <StatTile value={n(d.distinctExperiences)} label="different experiences" />
        </div>

        <section className="mt-12">
          <h2 className="font-heading text-2xl text-stone-900">The short version</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-stone-600">
            <li>
              {d.typeSplit.experience}% of picks were experiences. Shoppers who said they like both got
              experiences {d.bothExperienceShare}% of the time.
            </li>
            <li>
              One gift, the {kindle.name}, made up {kindle.share}% of all product picks.{" "}
              {wine.name.toLowerCase()} made up {wine.share}% of experience picks.
            </li>
            <li>
              Budgets held up to $100 and then loosened. At &ldquo;$250 or more,&rdquo; about one pick in five
              cost less than $250.
            </li>
            <li>
              Partners got personalized gifts {d.personalizedByRelationship[0].share}% of the time.
              Colleagues got them {d.personalizedByRelationship[5].share}% of the time.
            </li>
            <li>
              Nothing alcohol-related went to anyone under 18, apart from two mocktail classes.
            </li>
            <li>
              About 1 in 9 product names did not match a real listing exactly as written. Only{" "}
              {d.names.nothingCloseShare}% of the names we checked had nothing close.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-stone-900">It leans toward experiences</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              Overall, {d.typeSplit.experience}% of the picks were experiences like classes, tours and
              tastings, and {d.typeSplit.product}% were products. A third of the shoppers asked for
              experiences only, so that number is mostly their doing.
            </p>
            <p>
              The more telling group is the shoppers who said they like both. They got experiences{" "}
              {d.bothExperienceShare}% of the time, almost one pick in three, and that was steady for
              every relationship, age band and budget. Baby showers were the one exception at 23%.
            </p>
            <p>
              When a shopper picked one side, the AI stayed there. Of {n(d.prefCompliance.gifts.picks)}{" "}
              picks for people who want things only, none was an experience. Of{" "}
              {n(d.prefCompliance.experiences.picks)} picks for people who want experiences only, none
              was a product.
            </p>
          </div>
          <Card className="mt-6 gap-3 px-5 py-5 ring-stone-200">
            <BarList
              items={[
                { label: "Experiences, all shoppers", value: d.typeSplit.experience },
                { label: "Experiences, shoppers who chose “both”", value: d.bothExperienceShare },
              ]}
              max={100}
            />
          </Card>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-stone-900">The same few gifts keep coming back</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              The {kindle.name} was picked {kindle.picks} times, {kindle.share}% of all product picks and
              the single most common gift in the study. It was the top product for shoppers who like
              reading ({d.kindleReaders.share}% of them got a Kindle product in their three) and, less
              expectedly, for shoppers who like tech.
            </p>
            <p>
              Products spread out a lot, with {n(d.distinctProducts)} different ones across{" "}
              {n(d.productPicks)} picks. The ten most common made up {d.productTop10Share}% of them.
              Experiences repeated much more. The ten most common made up {d.experienceTop10Share}% of
              experience picks, and a wine tasting tour alone was {wine.share}%.
            </p>
            <p className="text-sm text-stone-500">
              Names are counted exactly as the AI wrote them, so &ldquo;Escape Room Challenge&rdquo; and
              &ldquo;Escape Room Experience&rdquo; are separate entries here. Merged, escape rooms would
              move up the list.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="gap-3 px-5 py-5 ring-stone-200">
              <h3 className="font-heading text-base text-stone-900">Most common products</h3>
              <BarList
                items={d.topProducts.map((p) => ({
                  label: p.name,
                  value: p.picks,
                  display: `${p.picks} (${p.share}%)`,
                }))}
                max={d.topExperiences[0].picks}
              />
            </Card>
            <Card className="gap-3 px-5 py-5 ring-stone-200">
              <h3 className="font-heading text-base text-stone-900">Most common experiences</h3>
              <BarList
                items={d.topExperiences.map((p) => ({
                  label: p.name,
                  value: p.picks,
                  display: `${p.picks} (${p.share}%)`,
                }))}
                max={d.topExperiences[0].picks}
              />
            </Card>
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Both charts use the same scale. Percentages are of product picks and of experience picks.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-stone-900">What each interest gets</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              Shoppers listed one or two interests. This is the product that showed up most often for
              each one, and how many of those shoppers got it in their three.
            </p>
            <p>
              Reading is the most predictable interest by a distance: a third of the readers got the
              same product. Art was the least predictable. Even the most common art pick, a drawing
              tablet, reached only {d.topProductByInterest.Art.share}% of artists.
            </p>
          </div>
          <Card className="mt-6 gap-0 divide-y divide-stone-100 px-5 py-1 ring-stone-200">
            {interests.map(([interest, v]) => (
              <div key={interest} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                <span className="w-24 shrink-0 text-stone-500">{interest}</span>
                <span className="flex-1 text-stone-800">{v.name}</span>
                <span className="shrink-0 tabular-nums text-stone-500">{v.share}%</span>
              </div>
            ))}
          </Card>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-stone-900">Budgets hold until the top</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              For every budget up to $100, at least 97% of the AI&apos;s price ranges landed inside what the
              shopper chose. At $100 to $250 that dropped to {d.budget[3].inBand}%. At &ldquo;$250 or
              more,&rdquo; {below250}% of picks were priced under $250.
            </p>
            <p>
              The median price at the top tier was {usd(d.budget[4].median)}, so the AI does go high. It just
              does not always go high enough. I don&apos;t know why. My guess is that a $400 gift feels
              risky when the AI knows so little about the person, but it is only a guess.
            </p>
          </div>
          <Card className="mt-6 gap-3 px-5 py-5 ring-stone-200">
            <h3 className="font-heading text-base text-stone-900">Picks priced inside the chosen budget</h3>
            <BarList
              items={d.budget.map((b) => ({
                label: b.budget,
                value: b.inBand,
                display: `${b.inBand}%  (median ${usd(b.median)})`,
              }))}
              max={100}
            />
          </Card>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-stone-900">Partners and anniversaries get the personalized gifts</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              We counted product picks with &ldquo;personalized,&rdquo; &ldquo;custom,&rdquo;
              &ldquo;engraved&rdquo; or &ldquo;monogram&rdquo; in the name. They were{" "}
              {d.personalizedByRelationship[0].share}% of what partners got and{" "}
              {d.personalizedByRelationship[5].share}% of what colleagues got. By occasion, anniversaries
              were far ahead at {d.personalizedByOccasion[0].share}%, against 18% for holidays.
            </p>
            <p>
              Etsy, where the personalized and handmade picks are sent, followed the same pattern. It
              was {d.etsyByOccasion[1].share}% of picks for baby showers and {d.etsyByOccasion[0].share}%
              for anniversaries, but around 12% to 14% for birthdays, holidays and no occasion at all.
              Across everything, picks went {d.storeSplit.viator}% to Viator for experiences,{" "}
              {d.storeSplit.amazon}% to Amazon and {d.storeSplit.etsy}% to Etsy.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="gap-3 px-5 py-5 ring-stone-200">
              <h3 className="font-heading text-base text-stone-900">Personalized, by relationship</h3>
              <BarList
                items={d.personalizedByRelationship.map((r) => ({ label: r.label, value: r.share }))}
                max={40}
              />
            </Card>
            <Card className="gap-3 px-5 py-5 ring-stone-200">
              <h3 className="font-heading text-base text-stone-900">Personalized, by occasion</h3>
              <BarList
                items={d.personalizedByOccasion.map((r) => ({ label: r.label, value: r.share }))}
                max={40}
              />
            </Card>
          </div>
          <p className="mt-2 text-xs text-stone-400">Share of product picks. Both charts use the same scale.</p>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-stone-900">It keeps kids away from alcohol</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              Shoppers under 18 got {n(d.minors.picks)} picks. Two were alcohol-related, and both were
              cocktail classes labeled as mocktail or teen-friendly versions. A wine tasting tour was the
              most common experience overall, and it was never suggested to anyone under 18.
            </p>
            <p className="text-sm text-stone-500">
              One caveat. The 18 to 30 age band includes people who can&apos;t legally drink in the US,
              and the data can&apos;t tell us how many of the 50 wine tastings in that band went to 18 to
              20 year olds.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl text-stone-900">Product names: mostly real, sometimes off</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              The AI is told to name real products. To see how well it does, we searched for each
              product name to see whether a listing for it exists. We checked all {d.names.specificChecked}{" "}
              names that include a brand or a model number, plus a random {d.names.genericChecked} of the
              other {n(d.names.genericPool)}.
            </p>
            <p>
              Across all {n(d.productPicks)} product picks, we estimate about {d.names.estimatedMismatchShare}%,
              roughly 1 in 9, carry a name that does not match a listing exactly as written. Almost all
              of those are real brands with a wrong detail: a bundle that no one sells (a Nintendo Switch
              baby bib set), a model number that doesn&apos;t exist, or the right toy under the wrong name.
              Only {d.names.nothingCloseNames} of the {d.names.checked} names we checked, {d.names.nothingCloseShare}%,
              had nothing close at all.
            </p>
            <p>
              A second issue is age. {d.names.specificDiscontinuedShareByPick}% of picks that named a brand
              were products no longer sold new. The Kindle Oasis is the biggest example, with 40 picks.
            </p>
            <p>
              The check also turned up two display problems on this site: notes stuck inside price
              fields and hedges like &ldquo;or similar&rdquo; in names. We cleaned both up in the live
              recommender. We also tried rewording the AI&apos;s instructions to fix the names. It helped
              a little and made budgets worse, so we left it alone.
            </p>
          </div>
        </section>

        <section className="mt-14" id="method">
          <h2 className="font-heading text-2xl text-stone-900">Method</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-600">
            <p>
              <span className="font-medium text-stone-800">The shoppers.</span> We generated{" "}
              {n(d.personas)} unique shoppers with a fixed random seed from the wizard&apos;s own options: 6
              relationships, 5 age bands, 6 occasions, 5 budgets, 3 gift preferences (things,
              experiences, both) and 10 interests, one or two per shopper. We removed combinations no one
              could pick, such as a 5 year old&apos;s colleague or an anniversary gift for a sibling.
              Shoppers had no names, locations or free-text notes.
            </p>
            <p>
              <span className="font-medium text-stone-800">The run.</span> On November 11, 2026, each
              shopper went through the same instructions, response format and AI model the live
              recommender uses (Anthropic&apos;s Claude Sonnet), one request each. The AI returns a ranked
              list. We analyzed the top three, which is what a visitor sees. That is {n(d.recommendations)}{" "}
              picks, because one shopper got a single gift back.
            </p>
            <p>
              <span className="font-medium text-stone-800">Counting.</span> A pick is a product or an
              experience as labeled by the AI. Names are counted exactly as written, ignoring case and
              punctuation. A price counts as inside the budget when the top of the AI&apos;s range reaches at
              least 80% of the budget&apos;s lower limit and the bottom of the range is no more than 110% of its
              upper limit. &ldquo;Personalized&rdquo; picks are product names containing personalized,
              custom, engraved or monogram. &ldquo;Alcohol-related&rdquo; picks have wine, beer, whiskey,
              whisky, bourbon, brewery, cocktail, spirits, liquor, vodka, tequila or distill in the name or
              search words.
            </p>
            <p>
              <span className="font-medium text-stone-800">Name checks.</span> A second AI model (Claude
              Haiku) searched the web for each product name and judged whether a product with that name is
              sold: exact match, generic category, discontinued, near miss (a real product under a
              noticeably different name), or not found. We calibrated it against 38 names we checked by
              hand. It flagged all 6 names we knew were wrong, and 1 of the 31 good names. The{" "}
              {d.names.estimatedMismatchShare}% figure combines the full count for brand and model names
              with the rate from the random sample of other names, which carries about plus or minus 5
              points. Experiences were not checked.
            </p>
            <p>
              <span className="font-medium text-stone-800">Limits.</span> These are made-up shoppers, not
              real ones, and they say nothing about what real people want or buy. It is one AI model on one
              day, and results can change when the model or the instructions do. We did not buy anything. The
              name checks depend on web search results and an AI judge, so treat them as estimates. We are not
              publishing the recommender&apos;s instructions.
            </p>
          </div>
        </section>

        <section className="mt-14" id="data">
          <h2 className="font-heading text-2xl text-stone-900">The data</h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Every pick from the study, one row each. Use it however you like. A link back to this page is
            appreciated.
          </p>
          <Card className="mt-5 gap-3 px-5 py-5 ring-stone-200">
            <a
              href={CSV_PATH}
              download
              className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              <Download className="h-4 w-4" />
              Download the CSV (1.3 MB)
            </a>
            <p className="text-xs leading-relaxed text-stone-500">
              {n(d.recommendations)} rows. Columns: persona_id, relationship, age_range, occasion,
              budget, gift_preference, interests, rank, gift_name, price, type, store, name_check. The
              name_check column holds the result for each product name (exact, category, discontinued,
              near_miss, not_found), unchecked for names outside the check, and not_applicable for
              experiences. Names and prices are as the AI wrote them, before any cleanup.
            </p>
          </Card>
        </section>

        <p className="mt-14 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-500">
          Questions, or a different cut of the data? Use the{" "}
          <Link href="/contact" className={link}>
            contact page
          </Link>
          . To see the recommender work on one real person, the{" "}
          <Link href="/wizard" className={link}>
            wizard
          </Link>{" "}
          takes about a minute. How picks are chosen is explained in{" "}
          <Link href="/how-we-choose" className={link}>
            how we choose
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
