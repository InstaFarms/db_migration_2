import * as propertySchemaModule from "./schema/property.ts";
import * as propertyActivitiesSchemaModule from "./schema/propertyActivities.ts";
import * as propertyAmenitySchemaModule from "./schema/propertyAmenity.ts";
import * as propertyCancellationSchemaModule from "./schema/propertyCancellation.ts";
import * as propertyCollectionSchemaModule from "./schema/propertyCollection.ts";
import * as propertyCouponSchemaModule from "./schema/propertyCoupon.ts";
import * as propertyDiscountSchemaModule from "./schema/propertyDiscount.ts";
import * as propertyMilestoneSchemaModule from "./schema/propertyMilestone.ts";
import * as propertyPhotoSchemaModule from "./schema/propertyPhoto.ts";
import * as propertyReviewSchemaModule from "./schema/propertyReview.ts";
import * as propertySpaceSchemaModule from "./schema/propertySpace.ts";
import * as propertySafetySchemaModule from "./schema/propertySafety.ts";
import * as propertyTagSchemaModule from "./schema/propertyTag.ts";
import * as locationSchemaModule from "./schema/location.ts";
import * as brandSchemaModule from "./schema/brand.ts";
import * as sharedSchemaModule from "./schema/shared.ts";
import * as bookingSchemaModule from "./schema/booking.ts";
import * as notificationSchemaModule from "./schema/notification.ts";
import * as auditSchemaModule from "./schema/audit.ts";
import * as proposalSchemaModule from "./schema/proposal.ts";
import * as adminSchemaModule from "./schema/admin.ts";
import * as enquirySchemaModule from "./schema/enquiry.ts";
import * as userSchemaModule from "./schema/user.ts";
import * as ownerFinanceSchemaModule from "./schema/ownerFinance.ts";
import * as ledgerSchemaModule from "./schema/ledger.ts";
import * as tdsAndGstSchemaModule from "./schema/tdsAndGst.ts";
import * as logSchemaModule from "./schema/log.ts";
import * as recentSchemaModule from "./schema/recent.ts";
import * as siteDataSchemaModule from "./schema/siteData.ts";
import * as otherSchemaModule from "./schema/other.ts";
import * as customerSchemaModule from "./schema/customer.ts";
import {
  createAccessibilitySetup,
  createTableNameEnum,
} from "./schema/accessibilitySetup.ts";


// export const beddingTypeEnum = pgEnum("beddingType", [
//   "KING",
//   "QUEEN",
//   "DOUBLE",
//   "SINGLE",
//   "SOFA_BED",
//   "MATTRESS",
//   "NONE"
// ]);

// Shared Schema
export const genderEnum = sharedSchemaModule.genderEnum;
export const settlementTimingEnum = sharedSchemaModule.settlementTimingEnum;
export const timestamps = sharedSchemaModule.timestamps;
export const adminUpdateReference = sharedSchemaModule.adminUpdateReference;
export const adminOrUserUpdateReference = sharedSchemaModule.adminOrUserUpdateReference;
export const setUserOrAdminUpdatedByConstraint = sharedSchemaModule.setUserOrAdminUpdatedByConstraint;
export const customers = customerSchemaModule.customers;
export const brands = brandSchemaModule.brands;

// Audit Schema
export const itemTypeEnum = auditSchemaModule.itemTypeEnum;
export const photoRequirementTypeEnum = auditSchemaModule.photoRequirementTypeEnum;
export const auditTypeEnum = auditSchemaModule.auditTypeEnum;
export const auditStatusEnum = auditSchemaModule.auditStatusEnum;
export const quantityStatusEnum = auditSchemaModule.quantityStatusEnum;
export const conditionStatusEnum = auditSchemaModule.conditionStatusEnum;
export const mediaTypeEnum = auditSchemaModule.mediaTypeEnum;
export const auditSectionEnum = auditSchemaModule.auditSectionEnum;
export const ticketPriorityEnum = auditSchemaModule.ticketPriorityEnum;
export const ticketStatusEnum = auditSchemaModule.ticketStatusEnum;
export const adminOrSupervisorUpdateReference =
  auditSchemaModule.adminOrSupervisorUpdateReference;
export const setSupervisorOrAdminUpdatedByConstraint =
  auditSchemaModule.setSupervisorOrAdminUpdatedByConstraint;
export const supervisors = auditSchemaModule.supervisors;
export const propertyAuditAreaCategoryMaster =
  auditSchemaModule.propertyAuditAreaCategoryMaster;
export const checklistCategoryMaster = auditSchemaModule.checklistCategoryMaster;
export const issueTypes = auditSchemaModule.issueTypes;

// Admin Schema
export const adminPanelRoleEnum = adminSchemaModule.adminPanelRoleEnum;
export const adminPermissionKeyEnum = adminSchemaModule.adminPermissionKeyEnum;
export const admins = adminSchemaModule.admins;
export const adminPermissions = adminSchemaModule.adminPermissions;
export const adminRolePermissions = adminSchemaModule.adminRolePermissions;

// Location Schema
export const states = locationSchemaModule.states;
export const cities = locationSchemaModule.cities;
export const areas = locationSchemaModule.areas;
export const brandsOnStates = locationSchemaModule.brandsOnStates;
export const brandsOnCities = locationSchemaModule.brandsOnCities;
export const brandsOnAreas = locationSchemaModule.brandsOnAreas;
export const landmarks = locationSchemaModule.landmarks;
export const nearbyLocations = locationSchemaModule.nearbyLocations;
export const areaDetailView = locationSchemaModule.areaDetailView;
export const areaDetailQuery = locationSchemaModule.areaDetailQuery;

// Users Schema
export const users = userSchemaModule.users;
export const bankDetails = userSchemaModule.bankDetails;
export const bankDetailsOnProperties = userSchemaModule.bankDetailsOnProperties;
export const ownersOnProperties = userSchemaModule.ownersOnProperties;
export const managersOnProperties = userSchemaModule.managersOnProperties;
export const caretakersOnProperties = userSchemaModule.caretakersOnProperties;

// Owner Finance Schema
export const ledgerDirectionEnum = ownerFinanceSchemaModule.ledgerDirectionEnum;
export const ownerWallet = ownerFinanceSchemaModule.ownerWallet;
export const ownerSettlement = ownerFinanceSchemaModule.ownerSettlement;
export const ownerSettlementAdjustments = ownerFinanceSchemaModule.ownerSettlementAdjustments;
export const ownerWalletLedger = ownerFinanceSchemaModule.ownerWalletLedger;
export const ownerPayouts = ownerFinanceSchemaModule.ownerPayouts;
export const ownerPayoutAttempts = ownerFinanceSchemaModule.ownerPayoutAttempts;
export const ownerWalletLedgerReferenceTypeEnum =
  ownerFinanceSchemaModule.ownerWalletLedgerReferenceTypeEnum;
export const ownerWalletLedgerComponentTypeEnum =
  ownerFinanceSchemaModule.ownerWalletLedgerComponentTypeEnum;
export const ownerWalletLedgerTypeEnum = ownerFinanceSchemaModule.ownerWalletLedgerTypeEnum;
export const ownerSettlementStatusEnum = ownerFinanceSchemaModule.ownerSettlementStatusEnum;
export const ownerSettlementAdjustmentTypeEnum =
  ownerFinanceSchemaModule.ownerSettlementAdjustmentTypeEnum;
export const ownerSettlementAdjustmentDirectionEnum =
  ownerFinanceSchemaModule.ownerSettlementAdjustmentDirectionEnum;
export const ownerPayoutStatusEnum = ownerFinanceSchemaModule.ownerPayoutStatusEnum;
export const ownerPayoutMethodEnum = ownerFinanceSchemaModule.ownerPayoutMethodEnum;
export const ownerPayoutGatewayEnum = ownerFinanceSchemaModule.ownerPayoutGatewayEnum;
export const ownerPayoutAttemptStatusEnum =
  ownerFinanceSchemaModule.ownerPayoutAttemptStatusEnum;

// Ledger Schema
export const platformLedgerTypeEnum = ledgerSchemaModule.platformLedgerCategoryEnum;
export const platformLedgerReferenceTypeEnum =
  ledgerSchemaModule.platformLedgerReferenceTypeEnum;
export const platformLedgerEntryTypeEnum = ledgerSchemaModule.platformLedgerEntryTypeEnum;
export const platformLedgerCategoryEnum = ledgerSchemaModule.platformLedgerCategoryEnum;
export const platformLedger = ledgerSchemaModule.platformLedger;

// TDS and GST Schema
export const tdsRecordReferenceTypeEnum = tdsAndGstSchemaModule.tdsRecordReferenceTypeEnum;
export const tdsRecordEntryTypeEnum = tdsAndGstSchemaModule.tdsRecordEntryTypeEnum;
export const gstRecordTypeEnum = tdsAndGstSchemaModule.gstRecordTypeEnum;
export const gstRecordReferenceTypeEnum = tdsAndGstSchemaModule.gstRecordReferenceTypeEnum;
export const gstRecordLiabilityHolderEnum = tdsAndGstSchemaModule.gstRecordLiabilityHolderEnum;
export const gstRecordEntryDirectionEnum = tdsAndGstSchemaModule.gstRecordEntryDirectionEnum;
export const tdsRecords = tdsAndGstSchemaModule.tdsRecords;
export const gstRecords = tdsAndGstSchemaModule.gstRecords;

// // -----------  Booking Schema --------------
// Enums
export const bookingPaymentChannelEnum = bookingSchemaModule.bookingPaymentChannelEnum;
export const bookingPaymentReceiverTypeEnum =
  bookingSchemaModule.bookingPaymentReceiverTypeEnum;
export const bookingPaymentMethodEnum = bookingSchemaModule.bookingPaymentMethodEnum;
export const bookingPaymentInstrumentEnum =
  bookingSchemaModule.bookingPaymentInstrumentEnum;
export const bookingPaymentGatewayEnum = bookingSchemaModule.bookingPaymentGatewayEnum;
export const bookingPaymentCaptureTypeEnum =
  bookingSchemaModule.bookingPaymentCaptureTypeEnum;
export const bookingPaymentForEnum = bookingSchemaModule.bookingPaymentForEnum;
export const bookingSourceTypeEnum = bookingSchemaModule.bookingSourceTypeEnum;
export const bookingTechPlatformEnum = bookingSchemaModule.bookingTechPlatformEnum;
// export const bookingSourceEnum = bookingSchemaModule.bookingSourceTypeOptions;
// export const bookingTableTypeEnum = bookingSchemaModule.bookingTableTypeEnum;
export const bookingLifecycleStatusEnum = bookingSchemaModule.bookingLifecycleStatusEnum;
export const bookingRequestStatusEnum = bookingSchemaModule.bookingRequestStatusEnum;
export const bookingRequestDecisionTakerTypeEnum =
  bookingSchemaModule.bookingRequestDecisionTakerTypeEnum;
export const bookingRequestRefundStatusEnum =
  bookingSchemaModule.bookingRequestRefundStatusEnum;
export const bookingCancellationTypeEnum = bookingSchemaModule.bookingCancellationTypeEnum;
export const bookingCancellationStayTypeEnum =
  bookingSchemaModule.bookingCancellationStayTypeEnum;
export const bookingCancellationRefundStatusEnum =
  bookingSchemaModule.bookingCancellationRefundStatusEnum;
export const bookingDiscountTypeEnum = bookingSchemaModule.bookingDiscountTypeEnum;
export const bookingDiscountValueTypeEnum =
  bookingSchemaModule.bookingDiscountValueTypeEnum;
export const bookingDiscountCalculationBaseEnum =
  bookingSchemaModule.bookingDiscountCalculationBaseEnum;
export const bookingRefundStatusEnum = bookingSchemaModule.bookingRefundStatusEnum;
export const bookingRefundAttemptStatusEnum =
  bookingSchemaModule.bookingRefundAttemptStatusEnum;
export const bookingRefundTypeEnum = bookingSchemaModule.bookingRefundTypeEnum;
export const bookingRefundInitiatedByTypeEnum =
  bookingSchemaModule.bookingRefundInitiatedByTypeEnum;
export const bookingPriceAdjustmentTypeEnum =
  bookingSchemaModule.bookingPriceAdjustmentTypeEnum;
export const bookingPriceAdjustmentFlowTypeEnum =
  bookingSchemaModule.bookingPriceAdjustmentFlowTypeEnum;
export const inventorySourceTypeEnum = bookingSchemaModule.inventorySourceTypeEnum;
export const inventoryBlockTypeEnum = bookingSchemaModule.inventoryBlockTypeEnum;
export const inventoryBlockCategoryEnum = bookingSchemaModule.inventoryBlockCategoryEnum;
export const inventoryStatusEnum = bookingSchemaModule.inventoryStatusEnum;
export const blockingTypeEnum = bookingSchemaModule.blockingTypeEnum;
export const blockingSourceEnum = bookingSchemaModule.blockingSourceEnum;
export const blockingReasonTypeEnum = bookingSchemaModule.blockingReasonTypeEnum;
export const blockingStatusEnum = bookingSchemaModule.blockingStatusEnum;
export const iCalOTAEnum = bookingSchemaModule.iCalOTAEnum;
// Tables
export const bookings = bookingSchemaModule.bookings;
export const bookingGuestBreakup = bookingSchemaModule.bookingGuestBreakup;
export const bookingPricingSummary = bookingSchemaModule.bookingPricingSummary;
export const bookingPriceDaywiseBreakup = bookingSchemaModule.bookingPriceDaywiseBreakup;
export const bookingRequests = bookingSchemaModule.bookingRequests;
export const bookingPayments = bookingSchemaModule.bookingPayments;
export const bookingDiscounts = bookingSchemaModule.bookingDiscounts;
export const bookingCancellation = bookingSchemaModule.bookingCancellation;
export const bookingPriceAdjustments = bookingSchemaModule.bookingPriceAdjustments;
export const bookingRefund = bookingSchemaModule.bookingRefund;
export const bookingRefundAttempt = bookingSchemaModule.bookingRefundAttempt;
export const blocking = bookingSchemaModule.blocking;
export const inventoryCalendar = bookingSchemaModule.inventoryCalendar;
export const bookingAuditLog = bookingSchemaModule.bookingAuditLog;
export const bookingPaymentSchedule = bookingSchemaModule.bookingPaymentSchedule;
export const icalLinks = bookingSchemaModule.icalLinks;
export const importedBookings = bookingSchemaModule.importedBookings;


// Property Schema
// Property enums
export const propertyAreaTypeEnum = propertySchemaModule.propertyAreaTypeEnum;
export const propertyDerivativeTypeByBrandEnum =
  propertySchemaModule.propertyDerivativeTypeByBrandEnum;
export const bookingTypeEnum = propertySchemaModule.bookingTypeEnum;
export const dayOfWeekEnum = propertySchemaModule.dayOfWeekEnum;
export const photoCategoryEnum = propertyPhotoSchemaModule.photoCategoryEnum;
export const cancellationPlanTypes =
  propertyCancellationSchemaModule.cancellationPlanTypes;

// Property core
export const propertyTypes = propertySchemaModule.propertyTypes;
export const properties = propertySchemaModule.properties;
export const propertyAreaMappings = propertySchemaModule.propertyAreaMappings;
export const propertyBrandMappings = propertySchemaModule.propertyBrandMappings;
export const propertyBrandBookingSettings =
  propertySchemaModule.propertyBrandBookingSettings;
export const propertyBrandPricingRules =
  propertySchemaModule.propertyBrandPricingRules;
export const propertiesDataSpecificToBrands =
  propertySchemaModule.propertyBrandMappings;
export const splitPropertyMappings = propertySchemaModule.splitPropertyMappings;
export const mergedPropertyMappings = propertySchemaModule.mergedPropertyMappings;
export const propertyDetailView = propertySchemaModule.propertyDetailView;

// Property features
export const activities = propertyActivitiesSchemaModule.activities;
export const activitiesOnProperties =
  propertyActivitiesSchemaModule.activitiesOnProperties;
export const amenities = propertyAmenitySchemaModule.amenities;
export const amenitiesOnProperties = propertyAmenitySchemaModule.amenitiesOnProperties;
export const safetyHygiene = propertySafetySchemaModule.safetyHygiene;
export const safetyHygieneOnProperties =
  propertySafetySchemaModule.safetyHygieneOnProperties;
export const spaces = propertySpaceSchemaModule.spaces;
export const spaceProperties = propertySpaceSchemaModule.spaceProperties;
export const tags = propertyTagSchemaModule.tags;
export const propertyTags = propertyTagSchemaModule.propertyTags;
export const collections = propertyCollectionSchemaModule.collections;
export const collectionProperties = propertyCollectionSchemaModule.collectionProperties;

// Property pricing and plans
export const specialDates = propertySchemaModule.specialDates;
export const coupons = propertyCouponSchemaModule.coupons;
export const propertyCoupons = propertyCouponSchemaModule.propertyCoupons;
export const discountPlans = propertyDiscountSchemaModule.discountPlans;
export const discountPlansValues = propertyDiscountSchemaModule.discountPlansValues;
export const propertyDiscountPlans = propertyDiscountSchemaModule.propertyDiscountPlans;
export const cancellationPlans = propertyCancellationSchemaModule.cancellationPlans;
export const cancellationPercentages =
  propertyCancellationSchemaModule.cancellationPercentages;
export const propertyCancellationPlans =
  propertyCancellationSchemaModule.propertyCancellationPlans;

// Property media and reviews
export const photos = propertyPhotoSchemaModule.photos;
export const photoPropertyBrandMapping =
  propertyPhotoSchemaModule.photoPropertyBrandMapping;
export const reviews = propertyReviewSchemaModule.reviews;
export const reviewMagicLinks = propertyReviewSchemaModule.reviewMagicLinks;

// Property milestones
export const propertyCommissionMilestones =
  propertyMilestoneSchemaModule.propertyCommissionMilestones;
export const propertyMilestoneResults =
  propertyMilestoneSchemaModule.propertyMilestoneResults;

// recent schema
export const recentlyVisited = recentSchemaModule.recentlyVisited;
export const recentSearches = recentSchemaModule.recentSearches;

// Site Data Schema
export const staticImageSectionEnum = siteDataSchemaModule.staticImageSectionEnum;
export const staticImages = siteDataSchemaModule.staticImages;
export const faqs = siteDataSchemaModule.faqs;
export const cms = siteDataSchemaModule.cms;
export const carousel = siteDataSchemaModule.carousel;
export const singlePages = siteDataSchemaModule.singlePages;
export const carouselPhotos = siteDataSchemaModule.carouselPhotos;
export const settings = siteDataSchemaModule.settings;
export const globalConstants = siteDataSchemaModule.globalConstants;



// Enquiry Schema
export const gatheringTypeEnum = enquirySchemaModule.gatheringTypeEnum;
export const eventTypeEnum = enquirySchemaModule.eventTypeEnum;
export const whatsappStatusEnum = enquirySchemaModule.whatsappStatusEnum;
export const enquiryTypeEnum = enquirySchemaModule.enquiryTypeEnum;
export const enquiryStatusEnum = enquirySchemaModule.enquiryStatusEnum;
export const enquiryPriorityEnum = enquirySchemaModule.enquiryPriorityEnum;
export const enquiries = enquirySchemaModule.enquiries;
export const contactEnquiry = enquirySchemaModule.contactEnquiry;
export const viewEnquiry = enquirySchemaModule.viewEnquiry;
export const searchQuery = enquirySchemaModule.searchQuery;
export const whatsappLog = enquirySchemaModule.whatsappLog;

// Notifications schema
export const notificationEventTypes = notificationSchemaModule.notificationEventTypes;
export const notificationRecipientRoleEnum = notificationSchemaModule.notificationRecipientRoleEnum;
export const notificationTemplates = notificationSchemaModule.notificationTemplates;
export const notificationDeliveryLog = notificationSchemaModule.notificationDeliveryLog;
export const notificationDeadLetterQueue = notificationSchemaModule.notificationDeadLetterQueue;
export const notificationEventLog = notificationSchemaModule.notificationEventLog;

// Proposals Schema
export const proposals = proposalSchemaModule.proposals;
export const proposalItems = proposalSchemaModule.proposalItems;

// Property Audit System - Property Areas & Audit Sessions
export const supervisorRoleEnum = auditSchemaModule.supervisorRoleEnum;
export const propertyAuditAreas = auditSchemaModule.propertyAuditAreas;
export const checklistItemMaster = auditSchemaModule.checklistItemMaster;
export const inventoryChecklistItems = auditSchemaModule.inventoryChecklistItems;
export const suppliesChecklistItems = auditSchemaModule.suppliesChecklistItems;
export const maintenanceChecklistItems = auditSchemaModule.maintenanceChecklistItems;
export const propertyAuditSessions = auditSchemaModule.propertyAuditSessions;
export const inventoryAuditChecklistItems = auditSchemaModule.inventoryAuditChecklistItems;
export const suppliesAuditChecklistItems = auditSchemaModule.suppliesAuditChecklistItems;
export const maintenanceAuditChecklistItems = auditSchemaModule.maintenanceAuditChecklistItems;
export const checklistItemMedia = auditSchemaModule.checklistItemMedia;
export const tickets = auditSchemaModule.tickets;
export const ticketResolutionLogs = auditSchemaModule.ticketResolutionLogs;

//logs schema
export const bulkOperationTypeEnum = logSchemaModule.bulkOperationTypeEnum;
export const bulkOperationModeEnum = logSchemaModule.bulkOperationModeEnum;
export const tableHistoryRoleEnum = logSchemaModule.tableHistoryRoleEnum;
export const tableHistoryOperationEnum = logSchemaModule.tableHistoryOperationEnum;
export const tableHistory = logSchemaModule.tableHistory;
export const bulkUpdateLogs = logSchemaModule.bulkUpdateLogs;
export const permanentPriceUpdateLogs = logSchemaModule.permanentPriceUpdateLogs;
export const activityLogRoleEnum = logSchemaModule.activityLogRoleEnum;
export const activityLogs = logSchemaModule.activityLogs;

// Other Schema
export const extraPlans = otherSchemaModule.extraPlans;

// Accessibility setup will generate these based on the tables provided
const accessibilitySetup = createAccessibilitySetup({
  brands,
  brandsOnStates,
  brandsOnCities,
  brandsOnAreas,
  propertyTypes,
  activities,
  activitiesOnProperties,
  amenities,
  amenitiesOnProperties,
  safetyHygiene,
  safetyHygieneOnProperties,
  states,
  cities,
  areas,
  landmarks,
  nearbyLocations,
  admins,
  adminPermissions,
  adminRolePermissions,
  settings,
  cancellationPlans,
  specialDates,
  cancellationPercentages,
  tags,
  propertyTags,
  cms,
  carousel,
  carouselPhotos,
  collections,
  collectionProperties,
  spaces,
  extraPlans,
  faqs,
  bookingAuditLog,
  staticImages,
  proposals,
  proposalItems,
  users,
  ownersOnProperties,
  managersOnProperties,
  caretakersOnProperties,
  properties,
  propertiesDataSpecificToBrands,
  splitPropertyMappings,
  mergedPropertyMappings,
  icalLinks,
  importedBookings,
  customers,
  bookingDiscounts,
  bookingCancellation,
  bookingPriceAdjustments,
  bookingRefund,
  bookingRefundAttempt,
  bookings,
  bookingGuestBreakup,
  bookingPricingSummary,
  bookingPriceDaywiseBreakup,
  bookingRequests,
  bookingPayments,
  discountPlans,
  discountPlansValues,
  coupons,
  propertyCoupons,
  propertyDiscountPlans,
  propertyCancellationPlans,
  blocking,
  inventoryCalendar,
  reviews,
  reviewMagicLinks,
  photos,
  photoPropertyBrandMapping,
  enquiries,
  spaceProperties,
  contactEnquiry,
  viewEnquiry,
  searchQuery,
  whatsappLog,
  globalConstants,
  bookingPaymentSchedule,
  platformLedger,
  propertyCommissionMilestones,
  propertyMilestoneResults,
  ownerWallet,
  ownerSettlement,
  ownerSettlementAdjustments,
  ownerWalletLedger,
  ownerPayouts,
  ownerPayoutAttempts,
  tdsRecords,
  gstRecords,
  supervisors,
  propertyAuditAreaCategoryMaster,
  propertyAuditAreas,
  checklistCategoryMaster,
  checklistItemMaster,
  issueTypes,
  inventoryChecklistItems,
  suppliesChecklistItems,
  maintenanceChecklistItems,
  propertyAuditSessions,
  inventoryAuditChecklistItems,
  suppliesAuditChecklistItems,
  maintenanceAuditChecklistItems,
  checklistItemMedia,
  tickets,
  ticketResolutionLogs,
});
export const adminOnlyTables = accessibilitySetup.adminOnlyTables;
export const userAccessibleTables = accessibilitySetup.userAccessibleTables;
export const allTables = accessibilitySetup.allTables;
export const tableNameEnum = createTableNameEnum(allTables);

// Exporting schemas
export * as propertySchema from "./schema/property.ts";
export * as propertyActivitiesSchema from "./schema/propertyActivities.ts";
export * as propertyAmenitySchema from "./schema/propertyAmenity.ts";
export * as propertyCancellationSchema from "./schema/propertyCancellation.ts";
export * as propertyCollectionSchema from "./schema/propertyCollection.ts";
export * as propertyCouponSchema from "./schema/propertyCoupon.ts";
export * as propertyDiscountSchema from "./schema/propertyDiscount.ts";
export * as propertyMilestoneSchema from "./schema/propertyMilestone.ts";
export * as propertyPhotoSchema from "./schema/propertyPhoto.ts";
export * as propertyReviewSchema from "./schema/propertyReview.ts";
export * as propertySafetySchema from "./schema/propertySafety.ts";
export * as propertySpaceSchema from "./schema/propertySpace.ts";
export * as propertyTagSchema from "./schema/propertyTag.ts";
export * as brandSchema from "./schema/brand.ts";
export * as bookingSchema from "./schema/booking.ts";
export * as notificationSchema from "./schema/notification.ts";
export * as auditSchema from "./schema/audit.ts";
export * as proposalSchema from "./schema/proposal.ts";
export * as adminSchema from "./schema/admin.ts";
export * as enquirySchema from "./schema/enquiry.ts";
export * as userSchema from "./schema/user.ts";
export * as ownerFinanceSchema from "./schema/ownerFinance.ts";
export * as ledgerSchema from "./schema/ledger.ts";
export * as tdsAndGstSchema from "./schema/tdsAndGst.ts";
export * as logSchema from "./schema/log.ts";
export * as recentSchema from "./schema/recent.ts";
export * as siteDataSchema from "./schema/siteData.ts";
export * as otherSchema from "./schema/other.ts";
export * as customerSchema from "./schema/customer.ts";
export * as accessibilitySetupSchema from "./schema/accessibilitySetup.ts";

// Backward-compatible aliases for legacy imports.
export const payments = bookingPayments;
export const cancellations = bookingCancellation;

// export const rooms = pgTable(
  //   "rooms",
  //   {
    //     id: uuid("id").primaryKey().defaultRandom(),
    
    //     propertyId: uuid("propertyId")
    //       .notNull()
    //       .references(() => properties.id, {
      //         onDelete: "cascade",
      //       }),
      
      //     roomName: text("roomName").notNull(),
      //     roomNumber: text("roomNumber"),

//     selectionPriority: integer("selectionPriority").notNull(),

//     hasAttachedBathroom: boolean("hasAttachedBathroom").notNull().default(false),
//     isAirConditioned: boolean("isAirConditioned").notNull().default(false),
//     floorNumber: integer("floorNumber"),

//     beddingType: beddingTypeEnum("beddingType").notNull(),
//     beddingCount: integer("beddingCount").notNull().default(1),

//     maxGuestCount: integer("maxGuestCount").notNull(),

//     isActive: boolean("isActive").notNull().default(true),

//     description: text("description"),
//     sortOrder: integer("sortOrder").default(0),

//     ...timestamps,
//     ...adminOrUserUpdateReference,
//   },
//   (table) => [
  //     check("max_guest_positive", sql`"maxGuestCount" > 0`),
  //     check("bedding_count_positive", sql`"beddingCount" > 0`),
  //     check("selection_priority_positive", sql`"selectionPriority" > 0`),
  
  //     index("rooms_property_id_idx").on(table.propertyId),
  //     index("rooms_selection_priority_idx").on(table.selectionPriority),
  //     index("rooms_is_active_idx").on(table.isActive),
  //     setUserOrAdminUpdatedByConstraint(table),
  //   ]
  // );
  
  // export const roomBasedPricingTiers = pgTable(
    //   "roomBasedPricingTiers",
    //   {
      //     id: uuid("id").primaryKey().defaultRandom(),
      
      //     propertyId: uuid("propertyId")
      //       .notNull()
      //       .references(() => properties.id, {
        //         onDelete: "cascade",
        //       }),
        
        //     numberOfRooms: integer("numberOfRooms").notNull(),
        //     totalPrice: integer("totalPrice").notNull(),
        //     weekendPrice: integer("weekendPrice"),
        
        //     isActive: boolean("isActive").notNull().default(true),
        
        //     ...timestamps,
        //     ...adminOrUserUpdateReference,
        //   },
        //   (table) => [
          //     check("number_of_rooms_positive", sql`"numberOfRooms" > 0`),
          //     check("total_price_positive", sql`"totalPrice" >= 0`),
          //     check("weekend_price_positive", sql`"weekendPrice" IS NULL OR "weekendPrice" >= 0`),
          
          //     unique("property_rooms_unique").on(table.propertyId, table.numberOfRooms),
          
          //     index("room_pricing_tiers_property_id_idx").on(table.propertyId),
          //     index("room_pricing_tiers_num_rooms_idx").on(table.numberOfRooms),
          //     setUserOrAdminUpdatedByConstraint(table),
          //   ]
          // );
          
          
          
          // export const bookingRooms = pgTable(
            //   "bookingRooms",
            //   {
              //     id: uuid("id").primaryKey().defaultRandom(),
              
              //     bookingId: uuid("bookingId")
              //       .notNull()
              //       .references(() => bookings.id, {
                //         onDelete: "cascade",
                //       }),
                //     roomId: uuid("roomId")
                //       .notNull()
                //       .references(() => rooms.id, {
                  //         onDelete: "cascade",
                  //       }),
                  
                  //     guestCount: integer("guestCount").notNull(),
                  
                  //     ...timestamps,
                  //     ...adminOrUserUpdateReference,
                  //   },
                  //   (table) => [
                    //     check("guest_count_positive", sql`"guestCount" > 0`),
                    
                    //     index("booking_rooms_booking_id_idx").on(table.bookingId),
                    //     index("booking_rooms_room_id_idx").on(table.roomId),
                    //     setUserOrAdminUpdatedByConstraint(table),
                    //   ]
                    // );
                    

