import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
  fakeAsync,
  flushMicrotasks,
} from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { mock } from "jest-mock-extended";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { PlanType } from "@bitwarden/common/billing/enums";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components";

import { CollectionAdminService } from "../../../../../vault/core/collection-admin.service";
import { GroupService, UserAdminService } from "../../../core";
import { MembersModule } from "../../members.module";

import { MemberDialogComponent, MemberDialogTab } from "./member-dialog.component";

describe("MemberDialogComponent", () => {
  let component: MemberDialogComponent;
  let fixture: ComponentFixture<MemberDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MembersModule],
      providers: [
        {
          provide: UserAdminService,
          useValue: mock<UserAdminService>(),
        },
        {
          provide: GroupService,
          useValue: mock<GroupService>(),
        },
        {
          provide: CollectionAdminService,
          useValue: mock<CollectionAdminService>(),
        },
        {
          provide: OrganizationService,
          useValue: mock<OrganizationService>(),
        },
        {
          provide: OrganizationUserService,
          useValue: mock<OrganizationUserService>(),
        },
        {
          provide: I18nService,
          useValue: mock<I18nService>(),
        },
        {
          provide: DialogService,
          useValue: mock<DialogService>(),
        },
        {
          provide: ConfigServiceAbstraction,
          useValue: mock<ConfigServiceAbstraction>(),
        },
        {
          provide: DIALOG_DATA,
          useValue: {
            initialTab: MemberDialogTab.Role,
            organizationId: 1,
            allOrganizationUserEmails: [],
          },
        },
        {
          provide: DialogRef,
          useValue: mock<DialogRef>(),
        },
        {
          provide: PlatformUtilsService,
          useValue: mock<PlatformUtilsService>(),
        },
        { provide: ComponentFixtureAutoDetect, useValue: true },
      ],
      schemas: [],
    }).compileComponents();
  });

  beforeEach(() => {
    const organizationService = TestBed.inject(OrganizationService);
    const collectionAdminService = TestBed.inject(CollectionAdminService);
    const i18nService = TestBed.inject(I18nService);

    jest
      .spyOn(organizationService, "get")
      .mockReturnValue({ seats: 2, planProductType: PlanType.Free } as unknown as Organization);
    jest.spyOn(collectionAdminService, "getAll").mockResolvedValue([]);
    jest.spyOn(i18nService, "t").mockImplementation((key) => key);

    fixture = TestBed.createComponent(MemberDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should initialize component", () => {
    expect(component).toBeTruthy();
  });

  it("should invite user when pressing enter on email input", fakeAsync(() => {
    const userServiceMock = TestBed.inject(UserAdminService);

    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector("#emails");

    // Update value and make Angular aware
    emailInput.value = "test@mydomain.com";
    emailInput.dispatchEvent(new Event("input"));

    // Trigger keyup.enter, which should submit form.
    emailInput.dispatchEvent(new KeyboardEvent("keydown", { key: "enter" }));

    expect(userServiceMock.invite).toHaveBeenCalledWith(["test@mydomain.com"], expect.anything());
  }));

  it("should not allow inviting a user when no email provided", fakeAsync(() => {
    // const form: HTMLFormElement = fixture.nativeElement.querySelector("form");
    // form.submit();

    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector("#emails");

    //emailInput.value = "test";
    emailInput.dispatchEvent(new Event("input"));
    emailInput.dispatchEvent(new KeyboardEvent("keydown", { key: "enter" }));

    flushMicrotasks();
    fixture.detectChanges();

    const describedBy = emailInput.getAttribute("aria-describedby");
    const error: HTMLFormElement = fixture.nativeElement.querySelector(`#${describedBy}`);

    expect(error.textContent).toContain("inputRequired");
  }));

  it("should not allow inviting a user when an invalid email is provided", fakeAsync(() => {
    // const form: HTMLFormElement = fixture.nativeElement.querySelector("form");
    // form.submit();

    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector("#emails");

    emailInput.value = "test";
    emailInput.dispatchEvent(new Event("input"));
    emailInput.dispatchEvent(new KeyboardEvent("keydown", { key: "enter" }));

    flushMicrotasks();
    fixture.detectChanges();

    const describedBy = emailInput.getAttribute("aria-describedby");
    const error: HTMLFormElement = fixture.nativeElement.querySelector(`#${describedBy}`);

    expect(error.textContent).toContain("multipleInputEmails");
  }));

  it("should not allow inviting a user when an limit reached", fakeAsync(() => {
    // const form: HTMLFormElement = fixture.nativeElement.querySelector("form");
    // form.submit();

    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector("#emails");

    emailInput.value = "test@mydomain.com, test2@mydomain.com, test3@mydomain.com";
    emailInput.dispatchEvent(new Event("input"));
    emailInput.dispatchEvent(new KeyboardEvent("keydown", { key: "enter" }));

    flushMicrotasks();
    fixture.detectChanges();

    const describedBy = emailInput.getAttribute("aria-describedby");
    const error: HTMLFormElement = fixture.nativeElement.querySelector(`#${describedBy}`);

    expect(error.textContent).toContain("subscriptionFreePlan");
  }));
});
