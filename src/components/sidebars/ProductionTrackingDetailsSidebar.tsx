/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Package, Calendar, User, Layers, FileCheck, Box, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

interface ProductionTrackingDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  production: any | null;
}

// Helper function to get stage badge styling
const getStageBadge = (stage: string, production?: any) => {
  // Check if production went through bidding
  const hasBiddingHistory = production ? (() => {
    const stageHistory = production.stageHistory || production.productionStages || [];
    return stageHistory.some((s: any) =>
      s.stage?.toLowerCase() === 'bidding' || s.stateName?.toLowerCase() === 'bidding'
    );
  })() : false;

  const normalizedStage = stage?.toLowerCase() || '';

  // Determine label and styling based on stage and bidding history
  let label = '';
  let className = '';

  if (normalizedStage === 'completed') {
    label = hasBiddingHistory ? 'Bidding Completed' : 'Completed';
    className = 'bg-green-100 text-green-700';
  } else if (normalizedStage === 'rejected') {
    label = hasBiddingHistory ? 'Bidding Rejected' : 'Rejected';
    className = 'bg-red-100 text-red-700';
  } else {
    const stages: Record<string, { label: string; className: string }> = {
      'pending assignment': { label: 'Pending Assignment', className: 'bg-gray-100 text-gray-700' },
      'in production': { label: 'In Production', className: 'bg-blue-100 text-blue-700' },
      'await qa': { label: 'Await QA', className: 'bg-amber-100 text-amber-700' },
      bidding: { label: 'Bidding', className: 'bg-purple-100 text-purple-700' },
    };

    const stageInfo = stages[normalizedStage] || { label: stage, className: 'bg-gray-100 text-gray-700' };
    label = stageInfo.label;
    className = stageInfo.className;
  }

  return (
    <span className={cn(
      "px-2 py-1 rounded text-xs font-medium",
      className
    )}>
      {label}
    </span>
  );
};

const ProductionTrackingDetailsSidebar = ({ open, onClose, production }: ProductionTrackingDetailsSidebarProps) => {
  if (!production) return null;

  const materialRequest = production.materialRequest;
  // const materialCount = materialRequest?.materials?.length || 0;
  const isApproved = materialRequest?.approvalStatus === 'approved';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">Production Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Information
            </h3>

            <div className="space-y-3 pl-6">
              <div>
                <label className="text-xs text-gray-500">Production Code</label>
                <p className="text-sm font-medium font-mono text-brand-700">{production.code || '-'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Product Name</label>
                <p className="text-sm font-medium">{production.productInfo?.name || '-'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Size</label>
                <p className="text-sm font-medium">Size {production.productInfo?.size || '-'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Stage</label>
                <div className="mt-1">
                  {getStageBadge(production.stage, production)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Material Request */}
          {materialRequest && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Material Request
                </h3>

                <div className="space-y-3 pl-6">
                  <div>
                    <label className="text-xs text-gray-500">Approval Status</label>
                    <div className="mt-1">
                      <Badge className={isApproved ? "bg-green-100 text-green-800 border-green-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                        {materialRequest.approvalStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>

                  {materialRequest.requestDate && (
                    <div>
                      <label className="text-xs text-gray-500">Request Date</label>
                      <p className="text-sm font-medium">{formatDate(materialRequest.requestDate)}</p>
                    </div>
                  )}

                  {materialRequest.approveDate && (
                    <div>
                      <label className="text-xs text-gray-500">Approval Date</label>
                      <p className="text-sm font-medium">{formatDate(materialRequest.approveDate)}</p>
                    </div>
                  )}
                </div>

                {/* Material Details */}
                {materialRequest.materials && materialRequest.materials.length > 0 && (
                  <div className="pl-6 space-y-2">
                    <label className="text-xs text-gray-500 font-semibold">Materials ({materialRequest.materials.length})</label>
                    {materialRequest.materials.map((material: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg bg-gray-50 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {material.materialDetails?.name || `Material #${material.item_id}`}
                            </p>
                            {material.materialDetails?.code && (
                              <p className="text-xs text-gray-500">
                                Code: {material.materialDetails.code}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-brand-700">
                              {material.qty} {material.materialDetails?.type?.unit || 'units'}
                            </p>
                            {material.materialDetails?.quantity !== undefined && (
                              <p className="text-xs text-gray-500">
                                Stock: {material.materialDetails.quantity}
                              </p>
                            )}
                          </div>
                        </div>

                        {material.materialDetails?.description && (
                          <p className="text-xs text-gray-600">
                            {material.materialDetails.description}
                          </p>
                        )}

                        {material.materialDetails?.type && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-white rounded border">
                              {material.materialDetails.type.name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity Breakdown */}
                {materialRequest.quantity && materialRequest.quantity.length > 0 && (
                  <div className="pl-6 space-y-2">
                    <label className="text-xs text-gray-500 font-semibold">Size Breakdown</label>
                    <div className="space-y-1.5">
                      {materialRequest.quantity.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded bg-white text-sm"
                        >
                          <span className="font-medium">Size {item.size}</span>
                          <span className="text-brand-700 font-semibold">{item.quantity} units</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-1 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-700">Total</span>
                        <span className="font-bold text-brand-700">
                          {materialRequest.quantity.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)} units
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />
            </>
          )}

          {/* Tailor Details */}
          {production.tailor && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Tailor Information
                </h3>

                <div className="space-y-3 pl-6">
                  <div>
                    <label className="text-xs text-gray-500">Name</label>
                    <p className="text-sm font-medium">{production.tailor.staffName}</p>
                  </div>

                  {production.tailor.email && (
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="text-sm">{production.tailor.email}</p>
                    </div>
                  )}

                  {production.tailor.phoneNumber && (
                    <div>
                      <label className="text-xs text-gray-500">Phone</label>
                      <p className="text-sm">{production.tailor.phoneNumber}</p>
                    </div>
                  )}

                  {production.assignDate && (
                    <div>
                      <label className="text-xs text-gray-500">Assigned Date</label>
                      <p className="text-sm font-medium">{formatDate(production.assignDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Production Stages History */}
          {production.productionStages && production.productionStages.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Production History
                </h3>

                <div className="pl-6 space-y-3">
                  {production.productionStages
                    .sort((a: any, b: any) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime())
                    .map((stage: any) => (
                      <div
                        key={stage.id}
                        className="relative pl-6 pb-3 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                      >
                        <div className="absolute left-0 top-1 -translate-x-[9px] w-4 h-4 rounded-full bg-brand-700 border-2 border-white"></div>
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-gray-900">{stage.stateName}</p>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(stage.changeDate)}
                            </span>
                          </div>
                          {stage.description && (
                            <p className="text-xs text-gray-600">{stage.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Bidding Information */}
          {production.stage?.toLowerCase() === 'bidding' && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Bidding
                </h3>

                <div className="space-y-3 pl-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-xs text-purple-900 font-medium mb-1">
                      This production is currently in bidding stage for additional fancy work.
                    </p>
                    <p className="text-xs text-purple-700">
                      Examples: stones, beads, crystals, embroidery, special decorative elements
                    </p>
                  </div>

                  {production.biddingNotes && (
                    <div>
                      <label className="text-xs text-gray-500">Fancy Work Description</label>
                      <p className="text-sm">{production.biddingNotes}</p>
                    </div>
                  )}

                  {production.biddingStartDate && (
                    <div>
                      <label className="text-xs text-gray-500">Bidding Started</label>
                      <p className="text-sm font-medium">{formatDate(production.biddingStartDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* QA Review */}
          {production.qaReviewDate && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  QA Review {production.qaReviewType === 'bidding' ? '(Bidding Work)' : ''}
                </h3>

                <div className="space-y-3 pl-6">
                  <div>
                    <label className="text-xs text-gray-500">Review Date</label>
                    <p className="text-sm font-medium">{formatDate(production.qaReviewDate)}</p>
                  </div>

                  {production.qaReviewedBy && (
                    <div>
                      <label className="text-xs text-gray-500">Reviewed By</label>
                      <p className="text-sm font-medium">
                        {production.qaReviewedByStaff?.staffName || `Staff #${production.qaReviewedBy}`}
                      </p>
                    </div>
                  )}

                  {production.qaDefects && (
                    <div>
                      <label className="text-xs text-gray-500">Defects</label>
                      <p className="text-sm">{production.qaDefects}</p>
                    </div>
                  )}

                  {production.qaNotes && (
                    <div>
                      <label className="text-xs text-gray-500">Notes</label>
                      <p className="text-sm">{production.qaNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Stock Information */}
          {production.movedToStock && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Stock Information
                </h3>

                <div className="space-y-3 pl-6">
                  <div>
                    <label className="text-xs text-gray-500">Moved to Stock</label>
                    <p className="text-sm font-medium">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Yes
                      </Badge>
                    </p>
                  </div>

                  {production.stockPushDate && (
                    <div>
                      <label className="text-xs text-gray-500">Push Date</label>
                      <p className="text-sm font-medium">{formatDate(production.stockPushDate)}</p>
                    </div>
                  )}

                  {production.stockLocation && (
                    <div>
                      <label className="text-xs text-gray-500">Location</label>
                      <p className="text-sm font-medium">{production.stockLocation}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h3>

            <div className="space-y-3 pl-6">
              {production.dateCreated && (
                <div>
                  <label className="text-xs text-gray-500">Date Created</label>
                  <p className="text-sm font-medium">{formatDate(production.dateCreated)}</p>
                </div>
              )}

              {production.dateCompleted && (
                <div>
                  <label className="text-xs text-gray-500">Date Completed</label>
                  <p className="text-sm font-medium">{formatDate(production.dateCompleted)}</p>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500">Production ID</label>
                <p className="text-sm font-medium">{production.id}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductionTrackingDetailsSidebar;
