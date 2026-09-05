// @vitest-environment jsdom
import { useContext, useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CourseColorsContext,
  CourseColorsProvider,
} from "../CourseColorsContext";
import { defaultColors } from "../courseColorPalette";

function BatchInitializer() {
  const { courseColors, initializeCourseColor } =
    useContext(CourseColorsContext);

  useEffect(() => {
    initializeCourseColor("COSC1P02");
    initializeCourseColor("MATH1P01");
  }, [initializeCourseColor]);

  return <output>{JSON.stringify(courseColors)}</output>;
}

describe("CourseColorsContext", () => {
  it("assigns distinct palette colours to courses initialized in one commit", async () => {
    render(
      <CourseColorsProvider>
        <BatchInitializer />
      </CourseColorsProvider>,
    );

    await screen.findByText((content) => content.includes("MATH1P01"));
    expect(JSON.parse(screen.getByRole("status").textContent)).toEqual({
      COSC1P02: defaultColors[0],
      MATH1P01: defaultColors[1],
    });
  });
});
