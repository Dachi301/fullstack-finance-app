import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    page = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the main heading', () => {
    const heading = page.querySelector('h1');

    expect(heading).not.toBeNull();
    expect(heading?.textContent).toContain(
      'Know where your money is going.',
    );
  });

  it('should display three feature cards', () => {
    const featureCards = page.querySelectorAll('.feature-card');

    expect(featureCards.length).toBe(3);
  });

  it('should link the main button to the dashboard', () => {
    const startButton =
      page.querySelector<HTMLAnchorElement>('.button--primary');

    expect(startButton).not.toBeNull();
    expect(startButton?.getAttribute('href')).toBe('/dashboard');
  });

  it('should display the Ledgerly brand', () => {
    const brand = page.querySelector('.brand');

    expect(brand?.textContent).toContain('Ledgerly');
  });
});