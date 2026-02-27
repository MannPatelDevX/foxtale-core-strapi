import type { Schema, Struct } from '@strapi/strapi';

export interface MarketingOffer extends Struct.ComponentSchema {
  collectionName: 'components_marketing_offers';
  info: {
    description: 'Offer configuration with items and key.';
    displayName: 'Offer';
  };
  attributes: {
    offer_items: Schema.Attribute.Component<'marketing.offer-item', true>;
  };
}

export interface MarketingOfferItem extends Struct.ComponentSchema {
  collectionName: 'components_marketing_offer_items';
  info: {
    description: 'Individual offer item with code, title, and description.';
    displayName: 'OfferItem';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.Text;
    offer_code: Schema.Attribute.Text;
    title: Schema.Attribute.Text;
  };
}

export interface ProductAdditionalInfoItem extends Struct.ComponentSchema {
  collectionName: 'components_product_additional_info_items';
  info: {
    description: 'Single additional information card with image, title and rich description.';
    displayName: 'AdditionalInfoItem';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ProductAdditionalInformation extends Struct.ComponentSchema {
  collectionName: 'components_product_additional_informations';
  info: {
    description: 'Additional information section with rich content cards.';
    displayName: 'AdditionalInformation';
  };
  attributes: {
    additional_info_items: Schema.Attribute.Component<
      'product.additional-info-item',
      true
    >;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    section_title: Schema.Attribute.String;
  };
}

export interface ProductAllAboutImageItem extends Struct.ComponentSchema {
  collectionName: 'components_product_all_about_image_items';
  info: {
    description: 'Single image with mobile/desktop variants and short description.';
    displayName: 'AllAboutImageItem';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.String;
    desktop_image: Schema.Attribute.Media;
    mobile_image: Schema.Attribute.Media;
  };
}

export interface ProductAllAboutItem extends Struct.ComponentSchema {
  collectionName: 'components_product_all_about_items';
  info: {
    description: 'All about section item with images, before/after/separator and copy.';
    displayName: 'AllAboutItem';
  };
  attributes: {
    after_image: Schema.Attribute.Component<'product.responsive-image', false>;
    before_image: Schema.Attribute.Component<'product.responsive-image', false>;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    images: Schema.Attribute.Component<'product.all-about-image-item', true>;
    item_tag: Schema.Attribute.String;
    item_title: Schema.Attribute.String;
    separator_image: Schema.Attribute.Component<
      'product.responsive-image',
      false
    >;
    tagline: Schema.Attribute.String;
  };
}

export interface ProductBenefitItem extends Struct.ComponentSchema {
  collectionName: 'components_product_benefit_items';
  info: {
    description: 'Single benefit with title, description and optional icon.';
    displayName: 'BenefitItem';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.Text;
  };
}

export interface ProductBenefits extends Struct.ComponentSchema {
  collectionName: 'components_product_benefits';
  info: {
    description: 'Benefits section with title and benefit items.';
    displayName: 'Benefits';
  };
  attributes: {
    benefit_items: Schema.Attribute.Component<'product.benefit-item', true>;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    section_title: Schema.Attribute.String;
  };
}

export interface ProductComboProductItem extends Struct.ComponentSchema {
  collectionName: 'components_product_combo_product_items';
  info: {
    description: 'Single combo product with description and linked product.';
    displayName: 'ComboProductItem';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.Text;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
  };
}

export interface ProductComboProducts extends Struct.ComponentSchema {
  collectionName: 'components_product_combo_products';
  info: {
    description: 'Combo products section with title and linked products.';
    displayName: 'ComboProducts';
  };
  attributes: {
    combo_product_items: Schema.Attribute.Component<
      'product.combo-product-item',
      true
    >;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    section_title: Schema.Attribute.String;
  };
}

export interface ProductComboSectionCarousel extends Struct.ComponentSchema {
  collectionName: 'components_product_combo_section_carousels';
  info: {
    description: 'Carousel section to highlight a combo product with creative backgrounds.';
    displayName: 'ComboSectionCarousel';
  };
  attributes: {
    auto_play: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    combo_item: Schema.Attribute.Component<
      'product.combo-section-carousel-item',
      false
    >;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    interval_ms: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<3000>;
    is_endless_carousel: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    show_component: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface ProductComboSectionCarouselItem
  extends Struct.ComponentSchema {
  collectionName: 'components_product_combo_section_carousel_items';
  info: {
    description: 'Single combo item configuration for the carousel (product + creative + labels).';
    displayName: 'ComboSectionCarouselItem';
  };
  attributes: {
    creative: Schema.Attribute.Component<'product.all-about-image-item', true>;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    is_visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    offer_label: Schema.Attribute.String;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    products_label: Schema.Attribute.String;
  };
}

export interface ProductCustomerSays extends Struct.ComponentSchema {
  collectionName: 'components_product_customer_says';
  info: {
    description: 'Customer testimonials section with title, copy and visual tags.';
    displayName: 'CustomerSays';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    show: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    tags: Schema.Attribute.Component<'product.title-image-color', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'What our Customers Say'>;
  };
}

export interface ProductDetailsItem extends Struct.ComponentSchema {
  collectionName: 'components_product_details_items';
  info: {
    description: 'Single product detail item with icon, rich description, and image.';
    displayName: 'DetailsItem';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    details_values: Schema.Attribute.Component<'product.details-values', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductDetailsValues extends Struct.ComponentSchema {
  collectionName: 'components_product_details_values';
  info: {
    description: 'Stylable detail value block with title, colors, image, and rich description.';
    displayName: 'DetailsValues';
  };
  attributes: {
    background_color: Schema.Attribute.Text;
    border_color: Schema.Attribute.Text;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    description_image: Schema.Attribute.Media<'images'>;
    display_type: Schema.Attribute.Enumeration<['DEFAULT', 'STRIP', 'TILE']> &
      Schema.Attribute.DefaultTo<'DEFAULT'>;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.Text;
    title_color: Schema.Attribute.Text;
  };
}

export interface ProductDirectionOfUse extends Struct.ComponentSchema {
  collectionName: 'components_product_direction_of_uses';
  info: {
    description: 'Directions of use section for the product.';
    displayName: 'Direction Of Use';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Directions of use'>;
  };
}

export interface ProductFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_product_faq_items';
  info: {
    description: 'Single frequently asked question with rich answer.';
    displayName: 'FaqItem';
  };
  attributes: {
    answer: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductFaqVideo extends Struct.ComponentSchema {
  collectionName: 'components_product_faq_videos';
  info: {
    description: 'FAQ video section for the product.';
    displayName: 'Faq Video';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    thumbnail: Schema.Attribute.Media;
    title: Schema.Attribute.String;
    video_url: Schema.Attribute.String;
  };
}

export interface ProductFaqs extends Struct.ComponentSchema {
  collectionName: 'components_product_faqs';
  info: {
    description: 'Frequently asked questions section for the product.';
    displayName: 'Faqs';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    items: Schema.Attribute.Component<'product.faq-item', true>;
    section_title: Schema.Attribute.String;
  };
}

export interface ProductHowToUse extends Struct.ComponentSchema {
  collectionName: 'components_product_how_to_uses';
  info: {
    description: 'Grouped how to use section including directions, ingredients and routine.';
    displayName: 'HowToUse';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    directions_of_use: Schema.Attribute.Component<
      'product.direction-of-use',
      false
    >;
    ingredients: Schema.Attribute.Component<'product.ingredients', false>;
    section_title: Schema.Attribute.String;
  };
}

export interface ProductIngredients extends Struct.ComponentSchema {
  collectionName: 'components_product_ingredients';
  info: {
    description: 'Full ingredient list section for the product.';
    displayName: 'Ingredients';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Full Ingredient List'>;
  };
}

export interface ProductListingCard extends Struct.ComponentSchema {
  collectionName: 'components_product_listing_cards';
  info: {
    description: 'Content for showing this product as a card on listing pages (collections, search). No price or inventory \u2014 use Shopify.';
    displayName: 'ListingCard';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    offer_code: Schema.Attribute.String;
    short_description: Schema.Attribute.Text;
    tags: Schema.Attribute.Component<'product.listing-tag', true>;
  };
}

export interface ProductListingTag extends Struct.ComponentSchema {
  collectionName: 'components_product_listing_tags';
  info: {
    description: 'Single tag for listing card: label, optional color, image, or collection link.';
    displayName: 'ListingTag';
  };
  attributes: {
    collection: Schema.Attribute.Relation<
      'oneToOne',
      'api::collection.collection'
    >;
    color: Schema.Attribute.String;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ProductRecommendedProducts extends Struct.ComponentSchema {
  collectionName: 'components_product_recommended_products';
  info: {
    description: 'Recommended products section with title and linked products.';
    displayName: 'RecommendedProducts';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    products: Schema.Attribute.Relation<'manyToMany', 'api::product.product'>;
    section_title: Schema.Attribute.String;
  };
}

export interface ProductRelatedProducts extends Struct.ComponentSchema {
  collectionName: 'components_product_related_products';
  info: {
    description: 'Related products section with title and linked products.';
    displayName: 'RelatedProducts';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    products: Schema.Attribute.Relation<'manyToMany', 'api::product.product'>;
    title: Schema.Attribute.Text;
  };
}

export interface ProductResponsiveImage extends Struct.ComponentSchema {
  collectionName: 'components_product_responsive_images';
  info: {
    description: 'Mobile and desktop image pair for responsive display.';
    displayName: 'ResponsiveImage';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    desktop_image: Schema.Attribute.Media;
    mobile_image: Schema.Attribute.Media;
  };
}

export interface ProductRoutine extends Struct.ComponentSchema {
  collectionName: 'components_product_routines';
  info: {
    description: 'Complete routine section linked to a collection.';
    displayName: 'Routine';
  };
  attributes: {
    collection: Schema.Attribute.Relation<
      'oneToOne',
      'api::collection.collection'
    >;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    show: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface ProductRoutineCard extends Struct.ComponentSchema {
  collectionName: 'components_product_routine_cards';
  info: {
    description: 'Routine card section with a single title, image and color card.';
    displayName: 'RoutineCard';
  };
  attributes: {
    card: Schema.Attribute.Component<'product.title-image-color', false>;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
  };
}

export interface ProductRoutineGuide extends Struct.ComponentSchema {
  collectionName: 'components_product_routine_guides';
  info: {
    description: 'Usage guide for the routine with optional media and rich-text steps.';
    displayName: 'RoutineGuide';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    media: Schema.Attribute.Media;
    title: Schema.Attribute.String;
  };
}

export interface ProductRoutineSection extends Struct.ComponentSchema {
  collectionName: 'components_product_routine_sections';
  info: {
    description: 'Complete routine section combining routine overview, badge card, and recommended products.';
    displayName: 'RoutineSection';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    recommended_products: Schema.Attribute.Component<
      'product.recommended-products',
      false
    >;
    routine_badge: Schema.Attribute.Component<
      'product.title-image-color',
      false
    >;
    routine_guide: Schema.Attribute.Component<'product.routine-guide', false>;
    routine_overview: Schema.Attribute.Component<'product.routine', false>;
    section_title: Schema.Attribute.String;
  };
}

export interface ProductStatisticItem extends Struct.ComponentSchema {
  collectionName: 'components_product_statistic_items';
  info: {
    description: 'Single statistic with percentage and description.';
    displayName: 'StatisticItem';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    percentage: Schema.Attribute.Decimal;
  };
}

export interface ProductStatistics extends Struct.ComponentSchema {
  collectionName: 'components_product_statistics';
  info: {
    description: 'Statistics section with title and statistic items.';
    displayName: 'Statistics';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    section_title: Schema.Attribute.String;
    statistic_items: Schema.Attribute.Component<'product.statistic-item', true>;
  };
}

export interface ProductTitleImageColor extends Struct.ComponentSchema {
  collectionName: 'components_product_title_image_colors';
  info: {
    description: 'Trust badge item with title, color and image.';
    displayName: 'TitleImageColor';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    image: Schema.Attribute.Media;
    title: Schema.Attribute.Text;
    title_color: Schema.Attribute.Text;
  };
}

export interface ProductTrustBadges extends Struct.ComponentSchema {
  collectionName: 'components_product_trust_badges';
  info: {
    description: 'Trust badges section with repeatable badge items.';
    displayName: 'TrustBadges';
  };
  attributes: {
    badges: Schema.Attribute.Component<'product.title-image-color', true>;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
  };
}

export interface ProductVariantItem extends Struct.ComponentSchema {
  collectionName: 'components_product_variant_items';
  info: {
    description: 'Single variant option with label and optional colour/image for PDP selector.';
    displayName: 'VariantItem';
  };
  attributes: {
    badge_text: Schema.Attribute.String;
    color_hex: Schema.Attribute.String;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    image: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String;
    shopify_option_value: Schema.Attribute.String;
  };
}

export interface ProductVariants extends Struct.ComponentSchema {
  collectionName: 'components_product_variants';
  info: {
    description: 'Variant configuration for PDP selector (size or colour palette).';
    displayName: 'Variants';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    option_name: Schema.Attribute.String;
    pdp_subtitle: Schema.Attribute.String;
    pdp_title: Schema.Attribute.String;
    variant_items: Schema.Attribute.Component<'product.variant-item', true>;
    variant_type: Schema.Attribute.Enumeration<['SIZE', 'COLOR_PALETTE']> &
      Schema.Attribute.DefaultTo<'SIZE'>;
  };
}

export interface ProductWhyThis extends Struct.ComponentSchema {
  collectionName: 'components_product_why_thises';
  info: {
    description: 'Why this product section with title, subtitle and rich description.';
    displayName: 'WhyThis';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.Text;
  };
}

export interface SharedAnnouncementBar extends Struct.ComponentSchema {
  collectionName: 'components_shared_announcement_bars';
  info: {
    description: 'Reusable announcement bar with optional autoplay and multiple messages.';
    displayName: 'AnnouncementBar';
  };
  attributes: {
    autoplay_interval_ms: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<0>;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    is_auto_play: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    messages: Schema.Attribute.Component<'shared.announcement-message', true>;
  };
}

export interface SharedAnnouncementMessage extends Struct.ComponentSchema {
  collectionName: 'components_shared_announcement_messages';
  info: {
    description: 'Single announcement bar message with optional link.';
    displayName: 'AnnouncementMessage';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    link_url: Schema.Attribute.String;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMetafield extends Struct.ComponentSchema {
  collectionName: 'components_shared_metafields';
  info: {
    description: 'Key/value metafield mapping for Shopify or internal flags.';
    displayName: 'Metafield';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    key: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO metadata overrides for products, pages and collections.';
    displayName: 'Seo';
  };
  attributes: {
    author: Schema.Attribute.String;
    canonical_url: Schema.Attribute.String;
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.Text;
    hide_sitemap: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    keywords: Schema.Attribute.Text;
    open_graph: Schema.Attribute.JSON;
    robots: Schema.Attribute.Enumeration<
      [
        'index',
        'noindex',
        'follow',
        'nofollow',
        'index_follow',
        'noindex_nofollow',
      ]
    >;
    title: Schema.Attribute.String;
    twitter: Schema.Attribute.JSON;
  };
}

export interface SharedShoppableVideoItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_shoppable_video_items';
  info: {
    description: 'Single shoppable video item with media and linked product.';
    displayName: 'ShoppableVideoItem';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    description: Schema.Attribute.Text;
    preview_image: Schema.Attribute.Media<'images'>;
    preview_video: Schema.Attribute.Media<'videos'>;
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    title: Schema.Attribute.String;
    video: Schema.Attribute.Media<'videos'>;
  };
}

export interface SharedShoppableVideos extends Struct.ComponentSchema {
  collectionName: 'components_shared_shoppable_videos';
  info: {
    description: 'Group of shoppable videos for products and collections (replaces Quinn).';
    displayName: 'ShoppableVideos';
  };
  attributes: {
    delivery_channels: Schema.Attribute.Enumeration<
      ['WEB', 'APP', 'BOTH', 'NONE']
    > &
      Schema.Attribute.DefaultTo<'BOTH'>;
    items: Schema.Attribute.Component<'shared.shoppable-video-item', true>;
    section_title: Schema.Attribute.String;
    videos_type: Schema.Attribute.Enumeration<
      ['POPOVER', 'CAROUSEL', 'CAMPAIGN_CAROUSEL']
    > &
      Schema.Attribute.DefaultTo<'POPOVER'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'marketing.offer': MarketingOffer;
      'marketing.offer-item': MarketingOfferItem;
      'product.additional-info-item': ProductAdditionalInfoItem;
      'product.additional-information': ProductAdditionalInformation;
      'product.all-about-image-item': ProductAllAboutImageItem;
      'product.all-about-item': ProductAllAboutItem;
      'product.benefit-item': ProductBenefitItem;
      'product.benefits': ProductBenefits;
      'product.combo-product-item': ProductComboProductItem;
      'product.combo-products': ProductComboProducts;
      'product.combo-section-carousel': ProductComboSectionCarousel;
      'product.combo-section-carousel-item': ProductComboSectionCarouselItem;
      'product.customer-says': ProductCustomerSays;
      'product.details-item': ProductDetailsItem;
      'product.details-values': ProductDetailsValues;
      'product.direction-of-use': ProductDirectionOfUse;
      'product.faq-item': ProductFaqItem;
      'product.faq-video': ProductFaqVideo;
      'product.faqs': ProductFaqs;
      'product.how-to-use': ProductHowToUse;
      'product.ingredients': ProductIngredients;
      'product.listing-card': ProductListingCard;
      'product.listing-tag': ProductListingTag;
      'product.recommended-products': ProductRecommendedProducts;
      'product.related-products': ProductRelatedProducts;
      'product.responsive-image': ProductResponsiveImage;
      'product.routine': ProductRoutine;
      'product.routine-card': ProductRoutineCard;
      'product.routine-guide': ProductRoutineGuide;
      'product.routine-section': ProductRoutineSection;
      'product.statistic-item': ProductStatisticItem;
      'product.statistics': ProductStatistics;
      'product.title-image-color': ProductTitleImageColor;
      'product.trust-badges': ProductTrustBadges;
      'product.variant-item': ProductVariantItem;
      'product.variants': ProductVariants;
      'product.why-this': ProductWhyThis;
      'shared.announcement-bar': SharedAnnouncementBar;
      'shared.announcement-message': SharedAnnouncementMessage;
      'shared.metafield': SharedMetafield;
      'shared.seo': SharedSeo;
      'shared.shoppable-video-item': SharedShoppableVideoItem;
      'shared.shoppable-videos': SharedShoppableVideos;
    }
  }
}
